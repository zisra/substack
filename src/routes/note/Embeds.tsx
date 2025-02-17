import { ArticleCard, Quote } from '@/components/EmbedComponents';
import type { Note } from '@/lib/types';

export function Embeds({ note }: { note: Note }) {
	if (!note.embed) return null;

	if (note.embed?.type === 'quote') {
		return <Quote url={note.embed.url} content={note.embed.content} author={note.embed.author} />;
	}
	return (
		<ArticleCard
			title={note.embed.title}
			author={note.embed.author}
			url={note.embed.url}
			image={note.embed.image}
			authorUrl={note.embed.authorImg}
		/>
	);
}
