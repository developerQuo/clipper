import { useState } from 'react';

type InputProps = {
	onSearch: (searchTerm: string) => void;
	onTimeFilterChange: (filter: string) => void;
};

const Filter = ({ onSearch, onTimeFilterChange }: InputProps) => {
	const [searchTerm, setSearchTerm] = useState('');

	const handleSearch = (e: any) => {
		setSearchTerm(e.target.value);
		onSearch(e.target.value);
	};

	const handleTimeFilterChange = (e: any) => {
		onTimeFilterChange(e.target.value);
	};

	return (
		<div className="flex items-center justify-between">
			<div className="input-group">
				<input
					className="input-bordered input"
					type="text"
					value={searchTerm}
					onChange={handleSearch}
					placeholder="검색어를 입력하세요."
					disabled
				/>
				<button className="btn-square btn" disabled>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</button>
			</div>
			{/* <div className="ml-4 p-2" onChange={handleTimeFilterChange}>
				<option value="1_week">1주일</option>
				<option value="1_month">1개월</option>
				<option value="3_months">3개월</option>
			</div> */}
		</div>
	);
};

export default Filter;
