import ChatDoc from '@/components/ui/chat';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ColumnType } from 'rc-table/lib/interface';
import { GetServerSideProps } from 'next';
import Table from '@/components/ui/Table';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { SelectedKeyType, SelectedKeyState } from '@/store/table';
import Viewer from '@/components/ui/pdf/viewer';
import { SelectedPDFState, SelectedPDFType } from '@/store/pdf';

export type DataType = {
	id: string;
	title: string;
	description: string;
	from: string;
};

const columns: ColumnType<DataType>[] = [
	{
		title: 'Media',
		dataIndex: 'from',
		width: 300,
	},
	{
		title: 'Title',
		dataIndex: 'title',
	},
	// {
	// 	title: 'Description',
	// 	dataIndex: 'description',
	// },
];

type InputProps = {
	content: { data: DataType[] | null; error: any; count: number | null };
};

// TODO: add favicon
export default function HomePage({ content }: InputProps) {
	const drawerRef = useRef<HTMLInputElement | null>(null);
	const [selectedKey, setSelectedKey] =
		useRecoilState<SelectedKeyType>(SelectedKeyState);
	const setPDF = useSetRecoilState<SelectedPDFType>(SelectedPDFState) || {};

	useEffect(() => {
		if (selectedKey) {
			drawerRef.current?.click();
		}
	}, [selectedKey]);

	const [showChild, setShowChild] = useState(false);

	// Wait until after client-side hydration to show
	useEffect(() => {
		setShowChild(true);
	}, []);

	if (!showChild) {
		// You can show some kind of placeholder UI here
		return null;
	}

	return (
		<div className="drawer drawer-end">
			<input
				ref={drawerRef}
				id="report-drawer"
				type="checkbox"
				className="drawer-toggle"
				onChange={(event) => {
					if (!event.target.checked) {
						setSelectedKey(undefined);
					}
				}}
			/>
			<div className="drawer-content">
				<div className="space-y-8">
					<h1 className="text-center text-3xl font-bold">Report</h1>
					<div className="flex flex-col space-y-2">
						<Table
							data={content.data ?? []}
							columns={columns}
							count={content.count ?? 0}
							additionalRowClick={({ title, from }) => {
								setPDF({ title, from });
							}}
						/>
					</div>
				</div>
			</div>
			{selectedKey && (
				<>
					<div className="drawer-side">
						<label htmlFor="report-drawer" className="drawer-overlay"></label>
						<div className="w-1/2 overflow-auto bg-base-100 p-4">
							<Viewer />
						</div>
					</div>
					<div className="absolute left-24 top-32">
						<ChatDoc />
					</div>
				</>
			)}
		</div>
	);
}

export const getServerSideProps: GetServerSideProps<InputProps> = async (
	context,
) => {
	// const guard = (await serverSideAuthGuard(context)) as any;
	// if (guard.hasOwnProperty("redirect")) return guard;
	// console.log(guard.props.session.user.id);
	const content = await supabase
		.from('pdf_meta')
		.select('id,title,description,from', { count: 'exact' })
		.eq('is_pdf', true)
		.eq('vector_upload', true)
		.in('id', [3, 4]);
	return { props: { content } };
};
