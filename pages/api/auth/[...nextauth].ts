import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
	session: {
		strategy: "jwt",
	},
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const validUser = credentials?.username === "admin";
				if (!validUser) {
					throw new Error("유저 정보가 올바르지 않습니다.");
				}

				const isValid = credentials.password === "password123";
				if (!isValid) {
					throw new Error("비밀번호가 올바르지 않습니다.");
				}
				return { id: "admin" };
			},
		}),
	],
});
