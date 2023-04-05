import { Content } from '@/store/content';
import moment from 'moment';
import Link from 'next/link';
import Bookmark from '../bookmark/button';

const Tag = ({ tag }: { tag: string }) => {
	return <div className="badge-outline badge">{tag}</div>;
};

const Card = ({
	id,
	title,
	media,
	tags,
	bookmark,
	bookmarks,
	published_at,
}: Content) => {
	const publishedAt = moment(published_at).format('YYYY-MM-DD');
	return (
		<Link href={`/clip/${id}`}>
			<div className="card w-80 bg-base-100 shadow-xl">
				<div className="card-body">
					<div className="relative">
						<h2 className="link card-title">{title}</h2>
						<p>
							{media} {publishedAt}
						</p>

						<div>
							<Bookmark id={id} bookmark={bookmark} />
						</div>
					</div>
					{/* <div className="card-actions justify-end">
						{tags?.map((tag, index) => (
							<Tag key={index} tag={tag} />
						))}
						<div className="badge-primary badge">{bookmarks}</div>
					</div> */}
				</div>
			</div>
		</Link>
	);
};

export default Card;
