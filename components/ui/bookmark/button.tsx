import {
	Content,
	SelectedContent,
	SelectedContentState,
} from '@/store/content';
import NotificationContext from '@/store/notification-context';
import { SelectedKeyState, SelectedKeyType } from '@/store/table';
import { useContext, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

type InputProps = Pick<Content, 'id' | 'bookmark'>;

export default function Bookmark({ id, bookmark }: InputProps) {
	const [checked, check] = useState(bookmark);
	const notificationCtx = useContext(NotificationContext);
	const onChange = () => {
		fetch(`/api/content/bookmark`, {
			method: 'POST',
			body: JSON.stringify({ contentId: id }),
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
				if (id) {
					check(!checked);
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
		<div className="form-control">
			<label className="label cursor-pointer space-x-2">
				<span className="label-text text-lg font-bold">북마크</span>
				<input
					type="checkbox"
					checked={checked}
					onChange={(e) => {
						e.stopPropagation();
						onChange();
					}}
					onClick={(e) => {
						e.stopPropagation();
					}}
					className="checkbox-warning checkbox"
				/>
			</label>
		</div>
	);
}
