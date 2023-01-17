import React from "react";
import Table from "./Table";
import UploadButton from "./UploadButton";

const Upload = () => {
	// TODO: 메시지 발송 폼에 전역변수 데이터 바인딩
	return (
		<div>
			<h4 className="page-header mb-4">Upload a CSV</h4>
			<UploadButton />
			<Table />
		</div>
	);
};

Upload.propTypes = {};

export default Upload;
