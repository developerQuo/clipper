import React, { useEffect } from 'react';
import RcTable, { TableProps } from 'rc-table';
import { DefaultRecordType } from 'rc-table/lib/interface';
import { useRecoilState } from 'recoil';
import { SelectedKeyType, SelectedKeyState } from '../../store/table';

export type InputProps<RecordType> = TableProps<RecordType> & {
	count?: number;
	additionalRowClick?: (record: RecordType) => void;
};

export default function Table<RecordType extends DefaultRecordType>({
	count,
	additionalRowClick,
	...props
}: InputProps<RecordType>) {
	const [selected, setSelected] =
		useRecoilState<SelectedKeyType>(SelectedKeyState);

	useEffect(() => {
		console.log(selected);
	}, [selected]);
	useEffect(() => {
		setSelected(undefined);
	}, [setSelected]);
	return (
		<RcTable
			components={{
				table: (props: any) => <table {...props} className="table w-full" />,
			}}
			rowClassName="text-center"
			rowKey={(record) => record.id}
			scroll={{ y: '30rem' }}
			emptyText="데이터가 없습니다."
			footer={() => (
				<div className="flex justify-end space-x-2 bg-gray-100 py-2 px-4 font-semibold text-gray-500">
					<span className="">전체:</span>
					<span className="">{count ?? props.data?.length}</span>
				</div>
			)}
			onHeaderRow={() => ({
				className: 'bg-gray-100 text-gray-500',
			})}
			onRow={(record) => ({
				onClick: () => {
					if (selected === record.id) {
						setSelected(undefined);
						return;
					}
					setSelected(record.id);
					additionalRowClick?.(record);
				},
				className: `cursor-pointer hover ${selected === record.id && 'active'}`,
			})}
			{...props}
		/>
	);
}
