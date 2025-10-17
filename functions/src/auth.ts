import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Admin SDK if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * 2nd Gen Cloud Function
 * Triggered when a pending role assignment is created.
 * Sets the role as a custom claim on the user.
 */
export const assignRoleOnCreateV2 = onDocumentCreated(
  "pending-role-assignments/{userId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("No data associated with the event");
      return;
    }

    const userId = event.params.userId;
    const roleData = snapshot.data();
    let role = roleData?.role || "homeowner";

    try {
      // Validate role
      if (!["homeowner", "contractor", "admin"].includes(role)) {
        logger.warn(`Invalid role '${role}' for ${userId}. Defaulting to 'homeowner'.`);
        role = "homeowner";
      }

      // Set custom claim
      await admin.auth().setCustomUserClaims(userId, { role });
      logger.info(`Custom claim '${role}' set for user: ${userId}`);

      // Also update the user document in Firestore
      await admin.firestore().collection("users").doc(userId).set(
        {
          role,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Clean up the temporary document
      await snapshot.ref.delete();
      logger.info(`Cleaned up pending role assignment for ${userId}`);
    } catch (error) {
      logger.error(`Error setting custom claim for user ${userId}`, error);
      // Set default role even if there's an error
      try {
        await admin.auth().setCustomUserClaims(userId, { role: "homeowner" });
      } catch (fallbackError) {
        logger.error(`Failed to set default role for ${userId}`, fallbackError);
      }
    }
  }
);