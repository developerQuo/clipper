import Image from 'next/image';
import { useContext } from 'react';
import { useRouter } from 'next/router';
import NotificationContext from '@/store/notification-context';

const deployUrl = process.env.NEXT_PUBLIC_DEPLOY_URL;

type InputProps = { disabled?: boolean; title: string; description: string };

export default function Share({ disabled, ...shareProps }: InputProps) {
	const notificationCtx = useContext(NotificationContext);
	const router = useRouter();
	const imageUrl = `${deployUrl}/images/logo/clipper_logo.png`;
	const webUrl = `${deployUrl}${router.asPath}`;

	const copyUrl = () => {
		if (navigator.clipboard) {
			navigator.clipboard
				.writeText(webUrl)
				.then(() => {
					notificationCtx.showNotification({
						title: 'URL copied!',
						message: '',
						status: 'success',
					});
				})
				.catch(() => {
					notificationCtx.showNotification({
						title: 'retry copy',
						message: '',
						status: 'warning',
					});
				});
		} else {
			if (!document.queryCommandSupported('copy')) {
				notificationCtx.showNotification({
					title: 'not supported browser',
					message: '',
					status: 'error',
				});
			}
		}
	};
	return (
		<>
			<div className="dropdown">
				<label
					tabIndex={0}
					className="cursor-pointer select-none p-1 font-bold transition-colors duration-200 ease-in-out "
					{...{ disabled }}
				>
					<Image
						src={`/icons/share.svg`}
						alt={`share`}
						width={14.33}
						height={18.33}
					/>
				</label>
				<div
					tabIndex={0}
					className="card dropdown-content card-compact w-20 p-2 text-primary-content shadow"
				>
					<div className="grid grid-cols-2 justify-center p-2">
						<label className="p-1" onClick={copyUrl}>
							<div className="placeholder avatar cursor-pointer">
								<div className="w-10 rounded-full bg-neutral-focus text-neutral-content hover:bg-gray-700">
									<span className="font-bold">URL</span>
								</div>
							</div>
						</label>
						{/* <KakaoShareButton
						imageUrl={imageUrl}
						webUrl={webUrl}
							{...shareProps}
						/> */}
					</div>
				</div>
			</div>
			{/* <FacebookShareButton
				url={fileUrl}
				quote={title}
				className="Demo__some-network__share-button"
			>
				<FacebookIcon size={32} round />
			</FacebookShareButton>
			<EmailShareButton
				url={fileUrl}
				subject={title}
				body="body"
				className="Demo__some-network__share-button"
			>
				<EmailIcon size={32} round />
			</EmailShareButton> */}
		</>
	);
}

// 링크 복사, 카톡
