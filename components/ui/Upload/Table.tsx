import React from "react";

export default function Table() {
	// TODO: 전역변수에서 데이터를 가져와서 테이블에 뿌려준다.
	return (
		<div className="overflow-x-auto">
			<table className="table-zebra table-compact table w-full">
				<thead>
					<tr>
						<th>Column 1</th>
						<th>Column 2</th>
						<th>Column 3</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Row 1</td>
						<td>Row 1</td>
						<td>Row 1</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
