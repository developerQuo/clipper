import { SelectedContent, SelectedContentState } from '@/store/content';
import NotificationContext from '@/store/notification-context';
import { SelectedKeyState, SelectedKeyType } from '@/store/table';
import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

export default function Bookmark() {
	const notificationCtx = useContext(NotificationContext);
	const [selectedContent, setSelectedContent] =
		useRecoilState<SelectedContent>(SelectedContentState);

	const onClick = () => {
		fetch(`/api/content/bookmark`, {
			method: 'POST',
			body: JSON.stringify({ contentId: selectedContent?.id }),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				console.log(res.ok);
				if (res.ok) {
					return res.json();
				}

				return res.json().then((data) => {
					throw new Error(`북마크를 실패하였습니다. \n${data}`);
				});
			})
			.then(() => {
				if (selectedContent?.id) {
					setSelectedContent({
						...selectedContent,
						bookmark: !selectedContent?.bookmark,
					});
				}
			})
			.catch((error) => {
				notificationCtx.showNotification({
					title: '실패!',
					message: error.message,
					status: 'error',
				});
			});
	};
	return (
		<button className={`btn-warning btn`} onClick={onClick}>
			{selectedContent?.bookmark ? '북마크됨' : '북마크'}
		</button>
	);
}
