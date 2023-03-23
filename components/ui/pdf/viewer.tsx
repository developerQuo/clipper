import { SelectedPDFState, SelectedPDFType } from '@/store/pdf';
import { useMemo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useRecoilValue } from 'recoil';
import useWindowSize from './useWindowSize';

// workerSrc 정의 하지 않으면 pdf 보여지지 않습니다.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Viewer = () => {
	const { title, from } =
		useRecoilValue<SelectedPDFType>(SelectedPDFState) || {};
	const windowSize = useWindowSize();
	const [numPages, setNumPages] = useState(0);
	const [pageNumber, setPageNumber] = useState(1);

	function onDocumentLoadSuccess({ numPages, ...props }: { numPages: number }) {
		console.log(props);
		setNumPages(numPages);
		setPageNumber(1);
	}
	const filePath = useMemo(() => `/docs/${from}/${title}.pdf`, [title, from]);
	return (
		<>
			{/* Page {pageNumber} of {numPages}
			{pageNumber > 1 && (
				<button onClick={() => setPageNumber((prev) => prev + -1)}>
					이전페이지
				</button>
			)}
			{pageNumber < numPages && (
				<button onClick={() => setPageNumber((prev) => prev + +1)}>
					다음페이지
				</button>
			)} */}
			<Document file={filePath} onLoadSuccess={onDocumentLoadSuccess}>
				{Array.from(new Array(numPages), (_, index) => (
					<Page
						width={windowSize.width}
						height={windowSize.height}
						key={index}
						pageNumber={index + 1}
						renderAnnotationLayer={false}
						scale={Math.floor(50000 / windowSize.width) / 100}
						renderTextLayer={false}
					/>
				))}
			</Document>
		</>
	);
};

export default Viewer;
