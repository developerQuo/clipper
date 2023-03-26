import { SelectedContent, SelectedContentState } from '@/store/content';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useRecoilValue } from 'recoil';
import { VariableSizeList as List } from 'react-window';
import { asyncMap } from '@wojtekmaj/async-array-utils';
import { useWindowWidth, useWindowHeight } from '@wojtekmaj/react-hooks';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { PageViewport } from 'pdfjs-dist/types/src/display/display_utils';

// workerSrc 정의 하지 않으면 pdf 보여지지 않습니다.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function View({ index, style }: { index: number; style: CSSProperties }) {
	return (
		<div style={style}>
			<Page pageIndex={index} />
		</div>
	);
}

const Viewer = () => {
	const windowWidth = useWindowWidth();
	const windowHeight = useWindowHeight();
	const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
	const [pageViewports, setPageViewports] = useState<PageViewport[] | null>(
		null,
	);

	const { path } = useRecoilValue<SelectedContent>(SelectedContentState) || {};
	const filePath = useMemo(() => `/docs${path}.pdf`, [path]);
	/**
	 * React-Window cannot get item size using async getter, therefore we need to
	 * calculate them ahead of time.
	 */
	useEffect(() => {
		setPageViewports(null);

		if (!pdf) {
			return;
		}

		(async () => {
			const pageNumbers = Array.from(new Array(pdf.numPages)).map(
				(_, index) => index + 1,
			);

			const nextPageViewports = await asyncMap(pageNumbers, (pageNumber) =>
				pdf.getPage(pageNumber).then((page) => page.getViewport({ scale: 1 })),
			);

			setPageViewports(nextPageViewports);
		})();
	}, [pdf]);

	function onDocumentLoadSuccess(nextPdf: PDFDocumentProxy) {
		setPdf(nextPdf);
	}

	function getPageHeight(pageIndex: number) {
		if (!pageViewports) {
			throw new Error('getPageHeight() called too early');
		}

		const pageViewport = pageViewports[pageIndex];

		return pageViewport.height;
	}

	return (
		<Document file={filePath} onLoadSuccess={onDocumentLoadSuccess}>
			{pdf && pageViewports ? (
				<List
					width={windowWidth!}
					height={windowHeight!}
					estimatedItemSize={getPageHeight(0)}
					itemCount={pdf.numPages}
					itemSize={getPageHeight}
				>
					{View}
				</List>
			) : null}
		</Document>
	);
};

export default Viewer;
