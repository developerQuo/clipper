import { GetServerSideProps } from 'next';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';

export default function Plan() {
	return (
		<div className="flex h-full flex-col items-center justify-center text-center">
			<h1 className="text-2xl font-semibold">
				클리퍼로 나만의 리포트를 생성해보세요!
			</h1>
			<ul className="mt-12 list-disc text-left text-lg font-medium">
				<li>모든 기능 사용 가능</li>
				<li>Generate 무제한 사용</li>
				<li>온라인 광고 제거</li>
			</ul>
			<span className="mt-10 font-bold text-[#2D2C96]">
				오늘 신청하면 10일 무료 체험!
			</span>
			<div className="mt-20">
				<button className="btn w-60 rounded-3xl" disabled>
					준비 중...
				</button>
				{/* <button className="btn w-60 rounded-3xl">체험하기</button> */}
			</div>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const guard = (await serverSideAuthGuard(context)) as any;
	if (guard.hasOwnProperty('redirect')) return guard;
	return {
		props: {},
	};
};
