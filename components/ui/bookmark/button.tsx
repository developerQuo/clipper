import NotificationContext from '@/store/notification-context';
import { Content } from '@/types/content';
import Image from 'next/image';
import { useContext, useState } from 'react';

type InputProps = Pick<Content, 'id' | 'bookmark'> & { disabled?: boolean };

export default function Bookmark({ id, bookmark, disabled }: InputProps) {
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
	const bookmarkId = `bookmark-${id}`;
	return (
		// <div className="form-control">
		// 	<label className="label cursor-pointer space-x-2"> */}
		// 	{/* <span className="label-text text-lg font-bold">북마크</span> */}
		// 	{/* <input
		// 			type="checkbox"
		// 			checked={checked}
		// 			onChange={(e) => {
		// 				e.stopPropagation();
		// 				onChange();
		// 			}}
		// 			onClick={(e) => {
		// 				e.stopPropagation();
		// 			}}
		// 			className="checkbox-warning checkbox"
		// 		/>
		// 	</label>
		// </div>
		<div className="flex" onClick={(e) => e.stopPropagation()}>
			<input
				// ref={ref}
				type="checkbox"
				id={bookmarkId}
				className="peer hidden"
				// value={value}
				checked={checked}
				onChange={(e) => {
					onChange();
				}}
				{...{ disabled }}
			/>
			<label
				htmlFor={bookmarkId}
				className="cursor-pointer select-none p-1 font-bold transition-colors duration-200 ease-in-out "
				{...{ disabled }}
			>
				<Image
					src={`/icons/bookmark-${checked ? 'checked' : 'unchecked'}.svg`}
					alt={`search`}
					width={16}
					height={16}
				/>
			</label>
		</div>
	);
}
