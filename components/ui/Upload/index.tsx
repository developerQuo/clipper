import React from "react";
import Table from "./Table";
import UploadButton from "./UploadButton";

const Upload = () => {
	// TODO: 메시지 발송 폼에 전역변수 데이터 바인딩
	return (
		<div>
			<div className="mb-4 ">
				<div className="flex justify-center">
					<h2 className="text-3xl font-bold">CSV 업로드</h2>
				</div>
				<UploadButton />
			</div>
			<Table />
		</div>
	);
};

Upload.propTypes = {};

export default Upload;
