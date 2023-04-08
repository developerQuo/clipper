import { SelectedContent, SelectedContentState } from '@/store/content';
import { supabase } from '@/utils/supabase-client';
import Image from 'next/image';
import { useMemo } from 'react';
import {
	EmailIcon,
	EmailShareButton,
	FacebookIcon,
	FacebookShareButton,
} from 'react-share';
import { useRecoilValue } from 'recoil';

type InputProps = { disabled?: boolean };

export default function Share({ disabled }: InputProps) {
	const { file_path, title } =
		useRecoilValue<SelectedContent>(SelectedContentState) || {};

	const fileUrl = useMemo(() => {
		if (file_path) {
			const { data } = supabase.storage.from('docs').getPublicUrl(file_path);

			return data.publicUrl;
		}
		return '#';
	}, [file_path]);
	return (
		<>
			<label
				className="cursor-pointer select-none p-1 font-bold transition-colors duration-200 ease-in-out "
				{...{ disabled }}
			>
				<Image
					src={`/icons/share.svg`}
					alt={`share`}
					width={13.33}
					height={18.33}
				/>
			</label>
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
