/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

const nextConfig = (phase) => {
	return {
		reactStrictMode: true,
		swcMinify: true,
		webpack(config) {
			config.experiments = { ...config.experiments, topLevelAwait: true };
			return config;
		},
		env: {
			NEXT_PUBLIC_DEPLOY_URL: process.env.NEXT_PUBLIC_DEPLOY_URL,
			NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
			GOOGLE_ID: process.env.GOOGLE_CLIENT_ID,
			GOOGLE_SECRET: process.env.GOOGLE_CLIENT_SECRET,
			OPENAI_API_KEY: process.env.OPENAI_API_KEY,
			KAKAO_APP_KEY: process.env.KAKAO_APP_KEY,
			...databaseConfig,
		},
		images: {
			remotePatterns: [
				{
					// google profile image
					protocol: 'https',
					hostname: 'lh3.googleusercontent.com',
					pathname: '/a/**',
				},
				{
					// kakao icon
					protocol: 'https',
					hostname: 'developers.kakao.com',
					port: '',
					pathname: '/assets/img/**',
				},
			],
		},
		output: 'standalone',
	};
};

const databaseConfig = {
	// firebase config
	// DATABASE_API_KEY: process.env.FIREBASE_API_KEY,
	// DATABASE_APP_ID: process.env.FIREBASE_APP_ID,
	// DATABASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
	// DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
	// DATABASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
	// DATABASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
	// DATABASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,

	// supabase config
	DATABASE_URL: process.env.SUPABASE_URL,
	DATABASE_API_KEY: process.env.SUPABASE_API_KEY,
	DATABASE_SECRET_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
	DATABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
};

module.exports = withBundleAnalyzer(nextConfig());
