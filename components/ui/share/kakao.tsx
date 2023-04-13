// components/KakaoShareButton.tsx

import Image from 'next/image';
import { useRouter } from 'next/router';

interface KakaoShareButtonProps {
	title: string;
	description: string;
	imageUrl?: string;
	webUrl?: string;
}

const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
	title,
	description,
	imageUrl,
	webUrl,
}) => {
	const router = useRouter()
	const shareToKakaoTalk = () => {
		if (typeof window !== 'undefined' && (window as any).Kakao) {
			const { Kakao } = window as any;

			if (!Kakao.isInitialized()) {
				alert('카카오 SDK를 초기화하지 못했습니다.');
				return;
			}

			Kakao.Link.sendDefault({
				objectType: 'feed',
				content: {
					title: title,
					description: description,
					imageUrl: imageUrl,
					link: {
						webUrl: webUrl,
						mobileWebUrl: webUrl,
					},
				},
				buttons: [
					{
						title: '자세히 보기',
						link: {
							webUrl: webUrl,
							mobileWebUrl: webUrl,
						},
					},
				],
			});
		} else {
			alert('카카오 SDK를 불러오지 못했습니다.');
		}
	};

	return (
		<label onClick={shareToKakaoTalk}>
			<Image
				className="cursor-pointer"
				src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png"
				alt="kakao icon"
				width={42}
				height={42}
			/>
		</label>
	);
};

export default KakaoShareButton;
