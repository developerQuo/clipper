import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { NotificationContextProvider } from '../store/notification-context';
import Layout from '../components/layout/Layout';
import { RecoilRoot } from 'recoil';
import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';
import { useEffect } from 'react';
import GoogleTranslate from '@/lib/google-translate';

export default function App({ Component, pageProps, router }: AppProps) {
	const isLogin = router.pathname === '/auth/signin';
	// useEffect(() => {
	// 	const script = document.createElement('script');
	// 	script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
	// 	script.async = true;
	// 	document.head.appendChild(script);
	// 	console.log(script);
	// }, []);
	return (
		<>
			{/* <Script
				strategy="afterInteractive"
				src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_TRACKING_ID}`}
			/>
			<Script id="google-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){window.dataLayer.push(arguments);}
					gtag('js', new Date());
			
					gtag('config', '${process.env.GA_TRACKING_ID}');
				`}
			</Script> */}
			<Script
				async
				src="https://developers.kakao.com/sdk/js/kakao.js"
				onLoad={() => {
					const { Kakao } = window as any;
					Kakao.init(process.env.KAKAO_APP_KEY);
					Kakao.isInitialized();
				}}
			/>
			<GoogleTranslate />
			<RecoilRoot>
				<SessionProvider session={pageProps.session}>
					<NotificationContextProvider>
						{isLogin ? (
							<Component {...pageProps} />
						) : (
							<Layout>
								<Component {...pageProps} />
							</Layout>
						)}
					</NotificationContextProvider>
				</SessionProvider>
			</RecoilRoot>
		</>
	);
}
