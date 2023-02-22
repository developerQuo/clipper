import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { collection, getDocs, query, where } from "firebase/firestore/lite";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { verifyPassword } from "../../../lib/auth";
import { db } from "../../../lib/firebase";

export default NextAuth({
	secret: process.env.SECRET,
	session: {
		strategy: "jwt",
	},
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.password || !credentials?.email) {
					throw new Error("이메일과 비밀번호를 입력해주세요");
				}

				const userRef = collection(db, "users");
				const q = query(userRef, where("email", "==", credentials?.email));
				const userSnap2 = await getDocs(q);
				if (userSnap2.empty) {
					throw new Error("이메일이 올바르지 않습니다.");
				}

				const { email, password } = userSnap2.docs[0].data();
				const isValid = await verifyPassword(credentials.password, password);
				if (!isValid) {
					throw new Error("비밀번호가 올바르지 않습니다.");
				}
				return { id: email, email };
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_ID as string,
			clientSecret: process.env.GOOGLE_SECRET as string,
		}),
	],
	adapter: FirestoreAdapter({
		apiKey: process.env.DATABASE_API_KEY,
		appId: process.env.DATABASE_APP_ID,
		authDomain: process.env.DATABASE_AUTH_DOMAIN,
		databaseURL: process.env.DATABASE_DATABASE_URL,
		projectId: process.env.DATABASE_PROJECT_ID,
		storageBucket: process.env.DATABASE_STORAGE_BUCKET,
		messagingSenderId: process.env.DATABASE_MESSAGING_SENDER_ID,
	}),
});
