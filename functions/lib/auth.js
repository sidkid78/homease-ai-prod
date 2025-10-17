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
exports.assignRoleOnCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Admin SDK if not already done
if (admin.apps.length === 0) {
    admin.initializeApp();
}
/**
 * Triggered on new user creation. Reads the intended role from a
 * 'pending_users' collection and sets it as a custom claim.
 */
exports.assignRoleOnCreate = functions.auth.user().onCreate(async (user) => {
    const firestore = admin.firestore();
    const pendingRoleRef = firestore.collection("pending-role-assignments").doc(user.uid);
    try {
        // Wait a moment for the client to create the document
        await new Promise(resolve => setTimeout(resolve, 1000));
        const roleDoc = await pendingRoleRef.get();
        let role = "homeowner"; // Default role
        if (roleDoc.exists) {
            const roleData = roleDoc.data();
            role = (roleData === null || roleData === void 0 ? void 0 : roleData.role) || "homeowner";
            // Validate role
            if (!["homeowner", "contractor", "admin"].includes(role)) {
                functions.logger.warn(`Invalid role '${role}' for ${user.uid}. Defaulting to 'homeowner'.`);
                role = "homeowner";
            }
            // Clean up the temporary document
            await pendingRoleRef.delete();
        }
        else {
            functions.logger.warn(`No pending role document found for user: ${user.uid}. Defaulting to 'homeowner'.`);
        }
        // Set custom claim
        await admin.auth().setCustomUserClaims(user.uid, { role });
        functions.logger.info(`Custom claim '${role}' set for user: ${user.uid}`);
    }
    catch (error) {
        functions.logger.error(`Error setting custom claim for user ${user.uid}`, error);
        // Set default role even if there's an error
        try {
            await admin.auth().setCustomUserClaims(user.uid, { role: "homeowner" });
        }
        catch (fallbackError) {
            functions.logger.error(`Failed to set default role for ${user.uid}`, fallbackError);
        }
    }
});
//# sourceMappingURL=auth.js.map