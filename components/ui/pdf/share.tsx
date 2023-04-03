import { SelectedContent, SelectedContentState } from '@/store/content';
import { supabase } from '@/utils/supabase-client';
import { useMemo } from 'react';
import {
	EmailIcon,
	EmailShareButton,
	FacebookIcon,
	FacebookShareButton,
} from 'react-share';
import { useRecoilValue } from 'recoil';

export default function Share() {
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
			<FacebookShareButton
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
			</EmailShareButton>
		</>
	);
}
