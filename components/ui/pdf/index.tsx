import ChatDoc from '@/components/ui/chat';
import { useEffect, useRef } from 'react';
import { ColumnType } from 'rc-table/lib/interface';
import Table from '@/components/ui/Table';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { SelectedKeyType, SelectedKeyState } from '@/store/table';
import Viewer from '@/components/ui/pdf/viewer';
import { SelectedPDFState, SelectedPDFType } from '@/store/pdf';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

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
];

type InputProps = {
	content: PostgrestSingleResponse<DataType[]>;
};

export default function Drawer({ content }: InputProps) {
	const drawerRef = useRef<HTMLInputElement | null>(null);
	const [selectedKey, setSelectedKey] =
		useRecoilState<SelectedKeyType>(SelectedKeyState);
	const setPDF = useSetRecoilState<SelectedPDFType>(SelectedPDFState) || {};

	useEffect(() => {
		if (selectedKey) {
			drawerRef.current?.click();
		}
	}, [selectedKey]);

	return (
		<div className="drawer">
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
					<div className="absolute right-24 top-32">
						<ChatDoc />
					</div>
				</>
			)}
		</div>
	);
}
