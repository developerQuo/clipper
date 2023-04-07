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
			<div className="card h-full cursor-default bg-base-100 shadow-xl">
				<div className="card-body min-h-[12rem] p-6">
					<div className="relatives flex flex-1 flex-col justify-evenly">
						<h2 className="link card-title text-lg">{title}</h2>
						<p className="pt-4 text-default">
							<span className="font-medium">{media}</span>{' '}
							<span className="text-text-secondary">{publishedAt}</span>
						</p>
						<div className="flex items-center justify-between pt-10">
							<div>
								{/* TODO: random color*/}
								{tags?.map((tag, index) => (
									<div key={index} className="badge-secondary badge">
										{tag}
									</div>
								))}
							</div>
							<div className="flex">
								<Bookmark id={id} bookmark={bookmark} />
								{bookmarks}
							</div>
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
