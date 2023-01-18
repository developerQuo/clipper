import { useEffect, useState } from "react";
import MMS from "../components/ui/MMS";
import Upload from "../components/ui/Upload";

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
	return (
		<div className="space-y-20">
			<Upload />
			<MMS />
		</div>
	);
}
