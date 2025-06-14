import { cn } from '@/lib/utils';
import type { StackRecursive } from './TableOfContents';

export function TocList({
	nodes,
	activeSlug,
	setActiveSlug,
	depth = 0,
}: {
	nodes: StackRecursive;
	activeSlug: string | null;
	setActiveSlug: (slug: string) => void;
	depth?: number;
}) {
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
					{node.children.length > 0 && (
						<TocList
							nodes={node.children}
							activeSlug={activeSlug}
							setActiveSlug={setActiveSlug}
							depth={depth + 1}
						/>
					)}
				</li>
			))}
		</ul>
	);
}
