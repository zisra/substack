import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import GithubSlugger from 'github-slugger';
import { TableOfContentsIcon } from 'lucide-react';

type Stack = {
	index: number;
	name: string | null;
	slug: string;
	children: StackRecursive;
};

type StackRecursive = Stack[];

function renderToc(nodes: StackRecursive, depth = 0) {
	return (
		<ul style={{ paddingLeft: depth * 20, marginTop: 6 }}>
			{nodes.map((node) => (
				<li key={node.index} style={{ marginBottom: 6 }}>
					<span
						className='block text-base text-muted-foreground transition duration-100 hover:cursor-pointer hover:text-black dark:hover:text-white'
						onClick={() => {
							const element = document.getElementById(node.slug);
							if (element) {
								element.scrollIntoView({ behavior: 'smooth' });
							}
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								const element = document.getElementById(node.slug);
								if (element) {
									element.scrollIntoView({ behavior: 'smooth' });
								}
							}
						}}
					>
						{node.name}
					</span>
					{node.children.length > 0 && renderToc(node.children, depth + 1)}
				</li>
			))}
		</ul>
	);
}

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

		return (
			<Popover>
				<PopoverTrigger>
					<Button variant='secondary' size='icon' className='size-8'>
						<TableOfContentsIcon />
					</Button>
				</PopoverTrigger>
				<PopoverContent align='center' side='right' className='w-64'>
					<h4 className='pb-2 text-xs uppercase'>Contents</h4>
					<div className='flex space-x-2'>{renderToc(tableOfContents)}</div>
				</PopoverContent>
			</Popover>
		);
	}
}
