import React from "react";
import { useRecoilValue } from "recoil";
import { csvState, CSVType } from "../../../store/recoilState";
import RcTable from "rc-table";
import { ColumnType } from "rc-table/lib/interface";

const columns: ColumnType<CSVType>[] = [
	{
		title: "이름",
		dataIndex: "name",
	},
	{
		title: "날짜",
		dataIndex: "dateTime",
	},
];

export default function Table() {
	const csvData = useRecoilValue(csvState);
	console.log(csvData);

	return (
		<RcTable
			columns={columns}
			data={csvData}
			components={{
				table: (props: any) => (
					<table
						{...props}
						className="table-zebra table-compact table w-full"
					/>
				),
			}}
			rowClassName="text-center"
			scroll={{ y: "30rem" }}
			emptyText="데이터가 없습니다."
			footer={() => (
				<div className="flex justify-end space-x-2 py-2 px-4 font-semibold text-gray-500">
					<span className="">전체:</span>
					<span className="">{csvData.length}</span>
				</div>
			)}
		/>
	);
}
