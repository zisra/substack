import Comment, { ArticleCard, Quote } from '@/components/EmbedComponents';
import type { Note } from '@/lib/types';

export function Embeds({ note }: { note: Note }) {
	if (!note.attachments) return null;

	return (
		<div>
			<div className='m-2 flex items-center justify-center gap-x-2'>
				{note.attachments
					.filter((attachment) => attachment?.type === 'image')
					.map((attachment) => (
						<a
							href={attachment.imageUrl}
							target='_blank'
							rel='noreferrer'
							className='cursor-zoom-in'
							key={attachment.imageUrl}
						>
							<img
								alt={'Post'}
								src={`https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/${encodeURIComponent(
									attachment.imageUrl,
								)}`}
								className='display-inline-block max-h-96'
							/>
						</a>
					))}
			</div>
			<div className='m-2'>
				{note.attachments
					.filter((attachment) => attachment?.type === 'post')
					.map((attachment) => {
						if (attachment.postSelection) {
							return (
								<Quote
									key={attachment.post.canonical_url}
									url={attachment.post.canonical_url}
									content={attachment.postSelection.text}
									author={attachment.publication.author_name ?? attachment.post.title}
								/>
							);
						}
						return (
							<ArticleCard
								key={attachment.post.canonical_url}
								title={attachment.post.title}
								author={attachment.publication.author_name}
								url={attachment.post.canonical_url}
								image={attachment.post.cover_image}
								authorImg={
									attachment.publication.logo_url || attachment.publication.author_photo_url
								}
							/>
						);
					})}
				{note.attachments
					.filter((attachment) => attachment?.type === 'comment')
					.map((attachment) => {
						return (
							<Comment
								key={attachment.trackingParameters.item_entity_key}
								id={attachment.trackingParameters.item_entity_key}
								author={attachment.comment.user.name}
								handle={attachment.comment.user.handle}
								avatar={attachment.comment.user.photo_url}
							/>
						);
					})}
			</div>
		</div>
	);
}
