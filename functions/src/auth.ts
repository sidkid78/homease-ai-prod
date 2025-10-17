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
  const pendingRoleRef = firestore.collection("pending-role-assignments").doc(user.uid);

  try {
    // Wait a moment for the client to create the document
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const roleDoc = await pendingRoleRef.get();
    let role = "homeowner"; // Default role

    if (roleDoc.exists) {
      const roleData = roleDoc.data();
      role = roleData?.role || "homeowner";
      
      // Validate role
      if (!["homeowner", "contractor", "admin"].includes(role)) {
        functions.logger.warn(`Invalid role '${role}' for ${user.uid}. Defaulting to 'homeowner'.`);
        role = "homeowner";
      }
      
      // Clean up the temporary document
      await pendingRoleRef.delete();
    } else {
      functions.logger.warn(`No pending role document found for user: ${user.uid}. Defaulting to 'homeowner'.`);
    }

    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, { role });
    functions.logger.info(`Custom claim '${role}' set for user: ${user.uid}`);

  } catch (error) {
    functions.logger.error(`Error setting custom claim for user ${user.uid}`, error);
    // Set default role even if there's an error
    try {
      await admin.auth().setCustomUserClaims(user.uid, { role: "homeowner" });
    } catch (fallbackError) {
      functions.logger.error(`Failed to set default role for ${user.uid}`, fallbackError);
    }
  }
});