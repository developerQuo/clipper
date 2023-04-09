import { getColor } from '@/utils/randomColor';

type InputProps = { tags?: string[]; id?: string };

export default function Tags({ tags, id }: InputProps) {
	return (
		<>
			{tags?.map((tag, index) => {
				const [background, color] = getColor(index + (id ? parseInt(id) : 0));
				return (
					<div
						key={index}
						className="btn-ghost btn-sm btn h-10 cursor-default rounded-xl text-xs"
						style={{ color, background }}
					>
						{tag}
					</div>
				);
			})}
		</>
	);
}
