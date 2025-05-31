import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Stack = {
	index: number;
	name: string | null;
	children: StackRecursive;
};

type StackRecursive = Stack[];

export function TableOfContents({
	content,
}: {
	content: string | null;
}) {
	const tagNames = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

	if (content) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(content, 'text/html');

		const headers = [...doc.querySelectorAll(tagNames.join(', '))];
		function getLevel(tagName: string) {
			return Number.parseInt(tagName.replace('H', ''), 10);
		}

		const tableOfContents: StackRecursive = [];
		const stack: StackRecursive = [];

		headers.forEach((header, index) => {
			const node = {
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
							<a href={`#${node.index}`}>{node.name}</a>
							{node.children.length > 0 && renderToc(node.children, depth + 1)}
						</li>
					))}
				</ul>
			);
		}

		return (
			<Card className='container mx-auto max-w-3xl p-4 shadow-none'>
				<CardHeader>
					<CardTitle>Table of contents</CardTitle>
				</CardHeader>
				<CardContent>{renderToc(tableOfContents)}</CardContent>
			</Card>
		);
	}
}
