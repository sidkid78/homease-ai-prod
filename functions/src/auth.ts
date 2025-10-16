import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Admin SDK if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Triggered on new user creation. Reads the intended role from a
 * 'pending_users' collection and sets it as a custom claim.
 */
export const assignRoleOnCreate = functions.auth.user().onCreate(async (user) => {
  const firestore = admin.firestore();
  const pendingUserRef = firestore.collection("pending_users").doc(user.uid);

  try {
    const userDoc = await pendingUserRef.get();
    if (!userDoc.exists) {
      functions.logger.warn(`No pending role document found for user: ${user.uid}. Defaulting to 'homeowner'.`);
      await admin.auth().setCustomUserClaims(user.uid, { role: "homeowner" });
      return;
    }

    const userData = userDoc.data();
    const role = userData?.role;

    if (role && ["homeowner", "contractor"].includes(role)) {
      await admin.auth().setCustomUserClaims(user.uid, { role });
      functions.logger.info(`Custom claim '${role}' set for user: ${user.uid}`);
    } else {
      // Default or handle invalid role
      await admin.auth().setCustomUserClaims(user.uid, { role: "homeowner" });
      functions.logger.warn(`Invalid or no role specified for ${user.uid}. Defaulting to 'homeowner'.`);
    }

    // Clean up the temporary document
    await pendingUserRef.delete();

  } catch (error) {
    functions.logger.error(`Error setting custom claim for user ${user.uid}`, error);
  }
});