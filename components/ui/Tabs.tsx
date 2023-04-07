import { useRouter } from 'next/router';

type TabsProps = {
	menuArr: {
		name: string;
		pathName: string;
		content: JSX.Element;
	}[];
};

export default function Tabs({ menuArr }: TabsProps) {
	const router = useRouter();
	const currentTab = router.query.tab || menuArr[0].pathName;
	return (
		<div className="space-y-16">
			<div className="tabs font-bold">
				{menuArr.map(({ name, pathName }, index) => (
					<li
						key={index}
						className={`tab-base tab ${
							pathName === currentTab ? 'tab-active' : ''
						}`}
						onClick={() =>
							router.replace({
								pathname: router.pathname,
								query: { tab: pathName },
							})
						}
					>
						{name}
					</li>
				))}
			</div>
			<div className="">
				{menuArr.find(({ pathName }) => pathName === currentTab)!.content}
			</div>
		</div>
	);
}
