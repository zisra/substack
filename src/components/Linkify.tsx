import { Fragment, type HTMLAttributes } from 'react';

export const Linkify = ({
	text,
	...props
}: {
	text: string;
} & HTMLAttributes<HTMLDivElement>) => {
	const linkifyText = (text: string) => {
		const urlPattern = /https?:\/\/[^\s]+/g;

		const parts = text.split(urlPattern);
		const links = text.match(urlPattern);

		return parts.map((part, index) => {
			if (links && index < links.length) {
				return (
					<Fragment>
						{part}
						<a href={links[index]} target="_blank" rel="noopener noreferrer">
							{links[index]}
						</a>
					</Fragment>
				);
			}
			return part;
		});
	};

	return <div {...props}>{linkifyText(text)}</div>;
};
