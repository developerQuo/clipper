export function getColor(index: number) {
	const colorIndex = index % 5;
	return colorIndex > 3 ? color[colorIndex % color.length] : color[colorIndex];
}

const color: string[][] = [
	['#2752EF', '#FFFFFF'],
	['#E7C9FB', '#222222'],
	['#222222', '#FFFFFF'],
	['#2FE08B', '#222222'],
];
