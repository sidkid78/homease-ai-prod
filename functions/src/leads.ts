import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// Initialize Admin SDK if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

interface ContractorProfile {
  vettingStatus: string;
  serviceAreaZips: string[];
  specialties: string[];
  averageRating?: number;
  reviewCount?: number;
  stripeAccountId?: string;
}

interface Contractor {
  id: string;
  contractorProfile?: ContractorProfile;
  // Add other user fields if necessary for matching/sorting
}

const MAX_MATCHES = 3; // Find up to 3 contractors per lead

export const onLeadCreated = functions.pubsub
  .topic("lead-created")
  .onPublish(async (message) => {
    try {
      // 1. Decode the message payload
      const payload = JSON.parse(Buffer.from(message.data, "base64").toString());
      const { leadId, requiredSpecialties } = payload;

      if (!leadId) {
        functions.logger.error("Message missing leadId");
        return null;
      }

      // 2. Fetch the lead document and update its status
      const leadRef = db.collection("leads").doc(leadId);
      const leadSnapshot = await leadRef.get();
      if (!leadSnapshot.exists) {
        functions.logger.error(`Lead with ID: ${leadId} not found.`);
        return null;
      }
      await leadRef.update({ status: "matching", updatedAt: new Date() });
      const leadData = leadSnapshot.data()!;

      // 3. Find potential contractors based on service area
      const homeownerZip = leadData.homeownerInfo.zip;
      if (!homeownerZip) {
        await leadRef.update({ status: "failed", error: "Missing homeowner zip code." });
        return null;
      }

      const contractorsQuery = db.collection("users")
        .where("role", "==", "contractor")
        .where("contractorProfile.vettingStatus", "==", "approved")
        .where("contractorProfile.serviceAreaZips", "array-contains", homeownerZip);

      const contractorsSnapshot = await contractorsQuery.get();
      if (contractorsSnapshot.empty) {
        functions.logger.warn(`No contractors found for zip code: ${homeownerZip}`);
        await leadRef.update({ status: "no_match_found", updatedAt: new Date() });
        return null;
      }

      // 4. Filter and rank the contractors in-memory
      let matchedContractors: Contractor[] = contractorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Contractor, 'id'> }));

      // Filter by specialty if provided
      if (requiredSpecialties && requiredSpecialties.length > 0) {
        matchedContractors = matchedContractors.filter((c: Contractor) =>
          requiredSpecialties.every((spec: string) => c.contractorProfile?.specialties?.includes(spec))
        );
      }

      // Sort by rating (descending) and then by number of reviews
      matchedContractors.sort((a, b) => {
        const ratingA = a.contractorProfile?.averageRating || 0;
        const ratingB = b.contractorProfile?.averageRating || 0;
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        const reviewsA = a.contractorProfile?.reviewCount || 0;
        const reviewsB = b.contractorProfile?.reviewCount || 0;
        return reviewsB - reviewsA;
      });

      // 5. Select the top N contractors and update the lead
      const finalMatchedIds = matchedContractors.slice(0, MAX_MATCHES).map(c => c.id);

      if (finalMatchedIds.length === 0) {
        await leadRef.update({ status: "no_match_found", updatedAt: new Date() });
      } else {
        await leadRef.update({
          status: "matched",
          matchedContractorIds: finalMatchedIds,
          updatedAt: new Date(),
        });
      }

      functions.logger.info(`Successfully matched ${finalMatchedIds.length} contractors to lead ${leadId}.`);
      return null;

    } catch (error) {
      functions.logger.error(`Error processing lead matching for message: ${message.data}`, error);
      // Optionally, update the lead with a 'failed' status
      const payload = JSON.parse(Buffer.from(message.data, "base64").toString());
      if (payload.leadId) {
        await db.collection("leads").doc(payload.leadId).update({ status: "failed" });
      }
      return null;
    }
  });

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,
  {
    // apiVersion: "2024-04-10", // Removed for now to avoid type conflict
    typescript: true,
  }
);

/**
 * A single webhook handler for all Stripe events.
 */
export const stripeWebhookHandler = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    // 1. Verify the request is genuinely from Stripe
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err: any) {
    functions.logger.error("Stripe webhook signature verification failed.", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // 2. Handle the event based on its type
  switch (event.type) {
    case "account.updated":
      await handleAccountUpdated(event.data.object as Stripe.Account);
      break;
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    // ... handle other event types as needed
    default:
      functions.logger.info(`Unhandled event type ${event.type}`);
  }

  // 3. Acknowledge receipt of the event
  res.status(200).json({ received: true });
});

/**
 * Handles the 'account.updated' event to update contractor vetting status.
 */
async function handleAccountUpdated(account: Stripe.Account) {
  const stripeAccountId = account.id;
  const usersRef = db.collection("users");
  const q = usersRef.where("contractorProfile.stripeAccountId", "==", stripeAccountId).limit(1);

  const snapshot = await q.get();
  if (snapshot.empty) {
    functions.logger.error(`No user found for Stripe account ID: ${stripeAccountId}`);
    return;
  }

  const userDoc = snapshot.docs[0];
  const newStatus = account.charges_enabled ? "approved" : "action_required";

  // Update the user's vetting status in Firestore
  await userDoc.ref.update({ "contractorProfile.vettingStatus": newStatus });
  functions.logger.info(`Updated vetting status for user ${userDoc.id} to '${newStatus}'.`);
}

/**
 * Handles 'checkout.session.completed' to fulfill a lead purchase.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { leadId, contractorId } = session.metadata!;

  if (!leadId || !contractorId) {
    functions.logger.error("Missing metadata (leadId or contractorId) in checkout session.", session.id);
    return;
  }

  const leadRef = db.collection("leads").doc(leadId);
  const transactionRef = db.collection("transactions").doc(session.id); // Use session ID for idempotency

  // Use a transaction to ensure atomicity
  await db.runTransaction(async (transaction) => {
    const txDoc = await transaction.get(transactionRef);
    if (txDoc.exists) {
      functions.logger.warn(`Transaction ${session.id} already processed.`);
      return; // Idempotency check
    }

    // Grant access to the lead
    transaction.update(leadRef, {
      purchasedBy: admin.firestore.FieldValue.arrayUnion(contractorId),
      status: "sold" // Or a similar status
    });

    // Log the transaction for accounting
    transaction.set(transactionRef, {
      contractorId,
      leadId,
      amount: session.amount_total, // amount_total is in cents
      currency: session.currency,
      stripePaymentIntentId: session.payment_intent,
      createdAt: new Date(),
    });
  });

  functions.logger.info(`Fulfilled purchase of lead ${leadId} for contractor ${contractorId}.`);
}