import { Content } from '@/store/content';
import moment from 'moment';
import Link from 'next/link';
import Bookmark from '../bookmark/button';
import { getColor } from '@/utils/randomColor';
import Tags from './tags';

const Tag = ({ tag }: { tag: string }) => {
	return <div className="badge-outline badge">{tag}</div>;
};

type InputProps = Pick<
	Content,
	| 'id'
	| 'title'
	| 'media'
	| 'tags'
	| 'bookmark'
	| 'bookmarks'
	| 'published_at'
	| 'tags'
> & {
	background?: string;
	color?: string;
};
const Card = ({
	id,
	title,
	media,
	tags,
	bookmark,
	bookmarks,
	published_at,
	...style
}: InputProps) => {
	const publishedAt = moment(published_at).format('YYYY-MM-DD');
	return (
		<Link href={`/clip/${id}`}>
			<div
				className="card h-full cursor-default bg-base-100 shadow-xl"
				{...(style
					? {
							style,
					  }
					: {})}
			>
				<div className="card-body min-h-[16rem] p-6">
					<div className="relatives flex flex-1 flex-col justify-evenly">
						<h2 className="card-title text-lg">{title}</h2>
						<p className="pt-4 text-default">
							<span className="font-medium">{media}</span>{' '}
							<span className="text-text-secondary">{publishedAt}</span>
						</p>
						<div className="flex items-center justify-between pt-10">
							<div className="flex-1 space-x-2 space-y-2">
								<Tags id={id} tags={tags?.slice(0, 2)} />
							</div>
							<div className="ml-4 flex">
								<Bookmark id={id} bookmark={bookmark} />
								{bookmarks}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default Card;
