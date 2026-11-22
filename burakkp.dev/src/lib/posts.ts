import { getCollection } from 'astro:content';

/** Published posts, newest first. Drafts never reach pages, lists or RSS. */
export async function getPublishedPosts() {
	return (await getCollection('blog', ({ data }) => !data.draft)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
}
