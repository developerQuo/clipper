import { findByRole, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

describe('챗 봇', () => {
	test('채팅 데이터가 화면에 표시된다.', async () => {
		// ARRANGE
		let introduction = {
			summary: `The document outlines the standard legislative process of the EU, 
            which involves proposals from the Commission, 
            approval from the Parliament and Council, and adoption into law.`,
			faq: ['net zero industry act', 'critical raw materials act'],
		};

		// ACT
		const {getByText, findAllByRole} = render(<Introduce summary={introduction.summary} faq={introduction.faq} />)

		// ASSERT
		expect(getByText(`The document outlines the standard legislative process of the EU, 
		which involves proposals from the Commission`)).toBeInTheDocument()
		expect(getByText(`net zero industry act`)).toBeInTheDocument()
		expect(getByText(`critical raw materials act`)).toBeInTheDocument()
		expect(await findAllByRole('button')).toHaveLength(2)
	});

	test('사용자 질문 req', async () => {
		// ARRANGE
		// ACT
		// ASSERT
	});

	test('텍스트 스트림', async () => {
		// ARRANGE
		// ACT
		// ASSERT
	});

	test('채팅 화면 구현', async () => {
		// ARRANGE
		// ACT
		// ASSERT
	});

	test('채팅 기록 초기화', async () => {
		// ARRANGE
		// ACT
		// ASSERT
	});
});
