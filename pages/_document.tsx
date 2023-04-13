import NextDocument, { Html, Head, Main, NextScript } from 'next/document';

class Document extends NextDocument {
	render() {
		return (
			<Html lang="ko">
				<Head>
					<link rel="shortcut icon" href="/images/logo/clipper_c.svg" />
				</Head>
				<body className="font-custom">
					<Main />
					<div id="drawer-root"></div>
					<NextScript />
					<div id="notifications"></div>
				</body>
			</Html>
		);
	}
}

export default Document;
