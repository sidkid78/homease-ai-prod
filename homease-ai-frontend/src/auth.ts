import NextAuth from "next-auth";
import { FirestoreAdapter } from "@auth/firestore-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { adminAuth } from "@/lib/firebase/admin";
import { cert } from "firebase-admin/app";

export const { handlers, signIn, signOut, auth: getServerSession } = NextAuth({
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  }),
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
          const firebaseUser = await adminAuth.getUser(user.id);
          token.role = firebaseUser.customClaims?.role || 'homeowner';
        } catch (error) {
          console.error("Error fetching custom claims:", error);
          token.role = 'homeowner';
        }
      }

      // On session update, refresh custom claims
      if (trigger === "update") {
        try {
          const firebaseUser = await adminAuth.getUser(token.sub!);
          token.role = firebaseUser.customClaims?.role || token.role;
        } catch (error) {
          console.error("Error refreshing custom claims:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
});

