import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GetServerSideProps } from 'next';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { DataType, default as PDF } from '@/components/ui/pdf';

type InputProps = {
	content: PostgrestSingleResponse<DataType[]>;
};

// TODO: add favicon
export default function HomePage({ content }: InputProps) {
	const [showChild, setShowChild] = useState(false);

	// Wait until after client-side hydration to show
	useEffect(() => {
		setShowChild(true);
	}, []);

	if (!showChild) {
		// You can show some kind of placeholder UI here
		return null;
	}

	return <PDF content={content} />;
}

export const getServerSideProps: GetServerSideProps<InputProps> = async (
	context,
) => {
	const guard = (await serverSideAuthGuard(context)) as any;
	if (guard.hasOwnProperty('redirect')) return guard;
	const content = await supabase
		.from('pdf_meta')
		.select('id,title,description,from', { count: 'exact' })
		.eq('is_pdf', true)
		.eq('vector_upload', true)
		.in('id', [3, 4, 5]);
	return { props: { content } };
};
