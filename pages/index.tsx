import { Fragment, useEffect, useState } from "react";
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
		<Fragment>
			<div>데이터 그리드</div>
			<Upload />
			<div>텍스트 폼</div>
			<div>전송 버튼</div>
		</Fragment>
	);
}
