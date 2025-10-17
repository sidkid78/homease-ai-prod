"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRoleOnCreateV2 = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
// Initialize Admin SDK if not already done
if (admin.apps.length === 0) {
    admin.initializeApp();
}
/**
 * 2nd Gen Cloud Function
 * Triggered when a pending role assignment is created.
 * Sets the role as a custom claim on the user.
 */
exports.assignRoleOnCreateV2 = (0, firestore_1.onDocumentCreated)("pending-role-assignments/{userId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        logger.warn("No data associated with the event");
        return;
    }
    const userId = event.params.userId;
    const roleData = snapshot.data();
    let role = (roleData === null || roleData === void 0 ? void 0 : roleData.role) || "homeowner";
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
        await admin.firestore().collection("users").doc(userId).set({
            role,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // Clean up the temporary document
        await snapshot.ref.delete();
        logger.info(`Cleaned up pending role assignment for ${userId}`);
    }
    catch (error) {
        logger.error(`Error setting custom claim for user ${userId}`, error);
        // Set default role even if there's an error
        try {
            await admin.auth().setCustomUserClaims(userId, { role: "homeowner" });
        }
        catch (fallbackError) {
            logger.error(`Failed to set default role for ${userId}`, fallbackError);
        }
    }
});
//# sourceMappingURL=auth.js.map