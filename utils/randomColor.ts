// TODO: load 할 때, 색 안바뀌게
function getRandomElements<T>(arr: T[], count: number): T[] {
	const result: T[] = [];
	const tempArr = [...arr];

	for (let i = 0; i < count; i++) {
		if (tempArr.length === 0) break;

		const randomIndex = Math.floor(Math.random() * tempArr.length);
		const randomElement = tempArr.splice(randomIndex, 1)[0];
		result.push(randomElement);
	}

	return result;
}

export const randomColor = (): string[] => {
	return getRandomElements(color, 1)[0];
};

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
