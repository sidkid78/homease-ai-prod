import NextAuth from "next-auth";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { adminAuth, adminApp } from "@/lib/firebase/admin";

export const { handlers, signIn, signOut, auth: getServerSession } = NextAuth({
  // Use Firestore adapter to sync sessions with Firestore
  adapter: FirestoreAdapter(adminApp),
  
  session: {
    strategy: "jwt",
  },
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Firebase Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Sign in with Firebase
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email as string,
            credentials.password as string
          );

          if (userCredential.user) {
            // Get custom claims (role)
            const token = await userCredential.user.getIdToken();
            const decodedToken = await adminAuth.verifyIdToken(token);

            return {
              id: userCredential.user.uid,
              email: userCredential.user.email,
              name: userCredential.user.displayName,
              role: decodedToken.role || 'homeowner',
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign in, get custom claims from Firebase
      if (user) {
        try {
          const userId = user.id || user.email?.split('@')[0] || '';
          if (userId) {
            const firebaseUser = await adminAuth.getUser(userId);
            token.role = firebaseUser.customClaims?.role || 'homeowner';
          } else {
            token.role = 'homeowner';
          }
        } catch (error) {
          console.error("Error fetching custom claims:", error);
          token.role = 'homeowner';
        }
      }

      // On session update, refresh custom claims
      if (trigger === "update" && token.sub) {
        try {
          const firebaseUser = await adminAuth.getUser(token.sub);
          token.role = firebaseUser.customClaims?.role || token.role;
        } catch (error) {
          console.error("Error refreshing custom claims:", error);
        }
      }

      return token;
    },
    
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as string) || 'homeowner';
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
