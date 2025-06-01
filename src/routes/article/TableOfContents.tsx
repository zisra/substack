import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import GithubSlugger from 'github-slugger';
import { TableOfContentsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type Stack = {
	index: number;
	name: string | null;
	slug: string;
	children: StackRecursive;
};

type StackRecursive = Stack[];

function renderToc(
	nodes: StackRecursive,
	activeSlug: string | null,
	setActiveSlug: (slug: string) => void,
	depth = 0,
) {
	return (
		<ul className={cn(depth > 0 && `pl-${depth * 4}`)}>
			{nodes.map((node) => (
				<li key={node.index} className='mt-1.5 mb-1 last:mb-0'>
					<a
						href={`#${node.slug}`}
						className={cn(
							'block max-w-full overflow-x-hidden truncate whitespace-nowrap text-base text-muted-foreground transition duration-100 hover:text-black dark:hover:text-white',
							activeSlug === node.slug && 'text-black! dark:text-white!',
						)}
						onClick={(e) => {
							e.preventDefault();
							const element = document.getElementById(node.slug);
							if (element) {
								element.scrollIntoView();

								document.addEventListener(
									'scrollend',
									() => {
										setActiveSlug(node.slug);
									},
									{ once: true },
								);
							}
						}}
					>
						{node.name}
					</a>
					{node.children.length > 0 &&
						renderToc(node.children, activeSlug, setActiveSlug, depth + 1)}
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
	const [activeSlug, setActiveSlug] = useState<string | null>(null);

	useEffect(() => {
		if (!content) return;
		const headings = Array.from(
			document.querySelectorAll(tagNames.map((t) => t.toLowerCase()).join(', ')),
		) as HTMLElement[];
		if (!headings.length) return;

		const handleIntersect = (entries: IntersectionObserverEntry[]) => {
			const visible = entries.filter((e) => e.isIntersecting);
			if (visible.length > 0) {
				const topMost = visible.reduce((a, b) =>
					a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
				);
				setActiveSlug((topMost.target as HTMLElement).id);
			} else {
				const above = entries.filter((e) => e.boundingClientRect.top < 80);
				if (above.length > 0) {
					const lastAbove = above.reduce((a, b) =>
						a.boundingClientRect.top > b.boundingClientRect.top ? a : b,
					);
					setActiveSlug((lastAbove.target as HTMLElement).id);
				}
			}
		};

		const observer = new window.IntersectionObserver(handleIntersect, {
			root: null,
			rootMargin: '0px 0px -90% 0px',
			threshold: 0.5,
		});

		headings.forEach((el) => {
			if (el.id) observer.observe(el);
		});
		return () => observer.disconnect();
	}, [content]);

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
					<Button
						variant='secondary'
						size='icon'
						className='size-8 shadow-2xl md:shadow-none print:hidden'
					>
						<TableOfContentsIcon />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align='center'
					side='right'
					className='max-h-[80vh] w-64 overflow-y-auto print:hidden'
				>
					<h4 className='pb-2 text-xs uppercase'>Contents</h4>
					{renderToc(tableOfContents, activeSlug, setActiveSlug)}
				</PopoverContent>
			</Popover>
		);
	}
	return null;
}
