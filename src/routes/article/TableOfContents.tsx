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

export type StackRecursive = Stack[];

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

								history.pushState(null, '', `#${node.slug}`);

								const rect = element.getBoundingClientRect();
								if (
									rect.top >= 0 &&
									rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
								) {
									setActiveSlug(node.slug);
									return;
								}

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

export function TableOfContents({ content }: { content: string | null }) {
	const tagNames = ['H1', 'H2', 'H3', 'H4'];
	const [activeSlug, setActiveSlug] = useState<string | null>(null);

	const HEADER_OFFSET = 53;
	const OBSERVER_MARGIN_TOP = -HEADER_OFFSET; // Exclude header space
	const OBSERVER_MARGIN_BOTTOM = -((window.innerHeight - HEADER_OFFSET) * 0.5); // Bottom padding

	useEffect(() => {
		const onNav = () => {
			const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
			if (hash) {
				setActiveSlug(hash);
			}
		};

		window.addEventListener('popstate', onNav);
		onNav();
		return () => {
			window.removeEventListener('popstate', onNav);
		};
	}, []);

	useEffect(() => {
		if (!content) return;

		const headings = Array.from(document.querySelectorAll(tagNames.join(', '))) as HTMLElement[];
		if (!headings.length) return;

		// Store currently visible headings
		let visibleHeadings: IntersectionObserverEntry[] = [];

		const setActiveFromVisible = () => {
			if (!visibleHeadings.length) return;

			// Sort by vertical position in DOM
			const sorted = visibleHeadings
				.filter((e) => e.isIntersecting)
				.sort(
					(a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top,
				);

			if (sorted.length > 0) {
				setActiveSlug((sorted[0].target as HTMLElement).id);
			}
		};

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const i = visibleHeadings.findIndex((e) => e.target === entry.target);
					if (entry.isIntersecting) {
						if (i === -1) visibleHeadings.push(entry);
						else visibleHeadings[i] = entry;
					} else if (i !== -1) {
						visibleHeadings.splice(i, 1);
					}
				}
				setActiveFromVisible();
			},
			{
				root: null,
				threshold: 0,
				rootMargin: `${OBSERVER_MARGIN_TOP}px 0px ${OBSERVER_MARGIN_BOTTOM}px 0px`,
			},
		);

		headings.forEach((el) => observer.observe(el));

		// Cleanup
		return () => {
			observer.disconnect();
			visibleHeadings = [];
		};
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
