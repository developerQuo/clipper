import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
	secret: process.env.SECRET,
	session: {
		strategy: 'jwt',
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID ?? '',
			clientSecret: process.env.GOOGLE_SECRET ?? '',
		}),
	],
	adapter: SupabaseAdapter({
		url: process.env.DATABASE_URL ?? '',
		secret: process.env.DATABASE_SECRET_KEY ?? '',
	}),
	debug: true,
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
	callbacks: {
		async session({ session, token }) {
			if (session?.user) {
				session.user.id = token.uid as string;
			}
			return session;
		},
		async jwt({ user, token }) {
			if (user) {
				token.uid = user.id;
			}
			return token;
		},
		async redirect({ url, baseUrl }) {
			// 로그인해도 개인화 프로세스 진행되도록
			return Promise.resolve(`${baseUrl}/auth/signin`);
		},
	},
};

export default NextAuth(authOptions);
