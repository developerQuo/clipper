import { Fragment, useEffect, useState } from "react";

// TODO: add favicon
export default function HomePage(props: any) {
	const [showChild, setShowChild] = useState(false);

	// Wait until after client-side hydration to show
	useEffect(() => {
		setShowChild(true);
	}, []);

	if (!showChild) {
		// You can show some kind of placeholder UI here
		return null;
	}
	return <Fragment></Fragment>;
}
