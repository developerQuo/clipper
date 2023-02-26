import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import jwt from "jsonwebtoken";
import { NextAuthOptions } from "next-auth";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";

export const authOptions: NextAuthOptions = {
	secret: process.env.SECRET,
	session: {
		strategy: "jwt",
	},
	providers: [
		// CredentialsProvider({
		// 	name: "Credentials",
		// 	credentials: {
		// 		email: { label: "Email", type: "email" },
		// 		password: { label: "Password", type: "password" },
		// 	},
		// 	async authorize(credentials) {
		// 		if (!credentials?.password || !credentials?.email) {
		// 			throw new Error("이메일과 비밀번호를 입력해주세요");
		// 		}

		// 		const userRef = collection(db, "users");
		// 		const q = query(userRef, where("email", "==", credentials?.email));
		// 		const userSnap2 = await getDocs(q);
		// 		if (userSnap2.empty) {
		// 			throw new Error("이메일이 올바르지 않습니다.");
		// 		}

		// 		const { email, password } = userSnap2.docs[0].data();
		// 		const isValid = await verifyPassword(credentials.password, password);
		// 		if (!isValid) {
		// 			throw new Error("비밀번호가 올바르지 않습니다.");
		// 		}
		// 		return { id: email, email };
		// 	},
		// }),
		GoogleProvider({
			clientId: process.env.GOOGLE_ID ?? "",
			clientSecret: process.env.GOOGLE_SECRET ?? "",
		}),
	],
	// adapter: SupabaseAdapter({
	// 	url: process.env.DATABASE_URL ?? "",
	// 	secret: process.env.DATABASE_SECRET_KEY ?? "",
	// }),
	// debug: true,
	adapter: FirestoreAdapter({
		apiKey: process.env.DATABASE_API_KEY,
		appId: process.env.DATABASE_APP_ID,
		authDomain: process.env.DATABASE_AUTH_DOMAIN,
		databaseURL: process.env.DATABASE_URL,
		projectId: process.env.DATABASE_PROJECT_ID,
		storageBucket: process.env.DATABASE_STORAGE_BUCKET,
		messagingSenderId: process.env.DATABASE_MESSAGING_SENDER_ID,
	}),
	// callbacks: {
	// 	async session({ session, user }) {
	// 		const signingSecret = process.env.DATABASE_JWT_SECRET;
	// 		if (signingSecret) {
	// 			const payload = {
	// 				aud: "authenticated",
	// 				exp: Math.floor(new Date(session.expires).getTime() / 1000),
	// 				sub: user.id,
	// 				email: user.email,
	// 				role: "authenticated",
	// 			};
	// 			session.supabaseAccessToken = jwt.sign(payload, signingSecret);
	// 		}
	// 		return session;
	// 	},
	// },
};

export default NextAuth(authOptions);
