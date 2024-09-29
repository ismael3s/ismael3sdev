import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { HOME } from "@consts";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
const parser = new MarkdownIt();

type Context = {
  site: string;
};

export async function GET(context: Context) {
  const blog = (await getCollection("garden")).filter(
    (post) => !post.data.draft
  );

  const items = [...blog].sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
  );

  return rss({
    title: HOME.TITLE,
    description: HOME.DESCRIPTION,
    trailingSlash: false,
    site: context.site,
    items: items.map((item) => ({
      title: item.data.title,
      description: item.data.description,
      pubDate: item.data.date,
      content: sanitizeHtml(parser.render(item.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      }),
      link: `/${item.collection}/${item.slug}/`,
    })),
  });
}
