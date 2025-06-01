import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GithubSlugger from 'github-slugger';

type Stack = {
	index: number;
	name: string | null;
	slug: string;
	children: StackRecursive;
};

type StackRecursive = Stack[];

export function TableOfContents({
	content,
}: {
	content: string | null;
}) {
	const tagNames = ['H1', 'H2', 'H3', 'H4'];

	if (content) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(content, 'text/html');

		const headers = [...doc.querySelectorAll(tagNames.join(', '))];
		function getLevel(tagName: string) {
			return Number.parseInt(tagName.replace('H', ''), 10);
		}

		const tableOfContents: StackRecursive = [];
		const stack: StackRecursive = [];
		const slugger = new GithubSlugger();

		headers.forEach((header, index) => {
			const node = {
				slug: slugger.slug(header.textContent ?? ''),
				index: index,
				name: header.textContent,
				children: [],
			};
			const level = getLevel(header.tagName);

			while (
				stack.length > 0 &&
				getLevel(headers[stack[stack.length - 1].index].tagName) >= level
			) {
				stack.pop();
			}

			if (stack.length === 0) {
				tableOfContents.push(node);
			} else {
				stack[stack.length - 1].children.push(node);
			}

			stack.push(node);
		});

		if (tableOfContents.length === 0) {
			return null;
		}

		function renderToc(nodes: StackRecursive, depth = 0) {
			return (
				<ul style={{ paddingLeft: depth * 16 }}>
					{nodes.map((node) => (
						<li key={node.index} style={{ marginBottom: 4 }}>
							<a href={`#${node.slug}`}>{node.name}</a>
							{node.children.length > 0 && renderToc(node.children, depth + 1)}
						</li>
					))}
				</ul>
			);
		}

		return (
			<Card className='mb-8 py-6 shadow-xs'>
				<CardHeader>
					<CardTitle>Table of contents</CardTitle>
				</CardHeader>

				<CardContent>
					<div className='flex space-x-2'>{renderToc(tableOfContents)}</div>
				</CardContent>
			</Card>
		);
	}
}
