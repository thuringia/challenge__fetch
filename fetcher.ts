/**
 * Parses the provided URLs into URL objects.
 *
 * - If the user provided a valid URL, use it
 * - If not, try to prepend the protocol
 * - If that fails, throw an error
 */
export const parseUrls = (urls: string[]) =>
  urls.map((url) => {
    try {
      // valid URL, use it
      return new URL(url);
    } catch (error) {
      // try to prepend the protocol
      try {
        return new URL(`https://${url}`);
      } catch (error) {
        // if that fails, throw an error
        throw new Error(
          `${url} is not a valid URL, and could not be expanded into one. Please check and try again.`,
        );
      }
    }
  });

/**
 * Collect page metadata using HTMLRewriter
 *
 * Due to the spec of HTMLRewriter,
 * we need to return a Response object even though we are not modifying the response.
 * We will store the metrics in the function parameter, relying on the fact that
 * Maps are passed by reference in JavaScript.
 *
 * This makes this function impure, but it is a tradeoff we are willing to make,
 * to leverage the power of HTMLRewriter as a fully compliant HTML parser.
 */
const collectPageMetadata = (page: Response, metrics: Map<string, number>) => {
  const rewriter = new HTMLRewriter();

  rewriter
    .on("a", {
      element() {
        const count = metrics.get("num_links") || 0;
        metrics.set("num_links", count + 1);
      },
    })
    .on("img", {
      element() {
        const count = metrics.get("images") || 0;
        metrics.set("images", count + 1);
      },
    });

  return rewriter.transform(page);
};

/**
 * A function to print the collected metadata
 * @example
 *   site: www.google.com
 *   num_links: 35
 *   images: 3
 *   last_fetch: Tue Mar 16 2021 15:46 UTC
 */
const printPageMetadata = (page: Response, metrics: Metrics) => {
  // check for last fetch, if we dont have it, set it to -1
  const lastFetch = metrics.get("last_fetch") || -1;

  // print the metadata
  // console.table currently doest not work in Bun, so we use console.info
  console.info(`site: ${page.url}`);
  console.info(`num_links: ${metrics.get("num_links")}`);
  console.info(`images: ${metrics.get("images")}`);
  console.info(
    `last_fetch: ${
      lastFetch !== -1 ? new Date(lastFetch).toLocaleString() : "never"
    }`,
  );
};

type Metrics = Map<"num_links" | "images" | "last_fetch", number>;

const getFilename = (r: Response) => `${new URL(r.url).hostname}.html`;

const getLatestFetch = (page: Response, metrics: Metrics) => {
  // check if the file already exists
  const file = Bun.file(getFilename(page));

  // if the file does not exist, we will show a message
  metrics.set("last_fetch", file.lastModified);
};

export const fetchWebsites = async (pages: string[], showMetadata: boolean) => {
  console.info("Fetching the following websites:", pages.join(", "));
  // fetch the websites and collect possible errors
  const websites = await Promise.allSettled(
    parseUrls(pages).map((url) => fetch(url)),
  );

  // report if fetching was successful, then save the HTML
  for (const website of websites) {
    switch (website.status) {
      case "fulfilled":
        console.info(`Successfully fetched ${website.value.url}`);
        const filename = getFilename(website.value);
        if (showMetadata) {
          const metrics: Metrics = new Map([
            ["num_links", 0],
            ["images", 0],
            ["last_fetch", 0],
          ]);
          const page = collectPageMetadata(website.value, metrics);
          getLatestFetch(page, metrics);
          // consume the response, thereby running the transform to collect the metrics
          await Bun.write(filename, page);
          printPageMetadata(page, metrics);
          console.info(`Saved ${website.value.url} to ${filename}`);
        }
        break;

      case "rejected":
        console.error(
          `Failed to fetch ${website.reason.url}: ${website.reason.message}`,
        );
        break;
    }
  }
};
