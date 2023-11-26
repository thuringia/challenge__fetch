type Metrics = Record<"num_links" | "images" | "last_fetch", number>;

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
 * objects are passed by reference in JavaScript.
 *
 * This makes this function impure, but it is a tradeoff we are willing to make,
 * to leverage the power of HTMLRewriter as a fully compliant HTML parser.
 */
const collectPageMetadata = (page: Response, metrics: Metrics) => {
  const rewriter = new HTMLRewriter();

  rewriter
    .on("a", {
      element() {
        metrics.num_links++;
      },
    })
    .on("img", {
      element() {
        metrics.images++;
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
  // print the metadata
  // console.table currently doest not work in Bun, so we use console.info
  console.info(`site: ${page.url}`);
  console.info(`num_links: ${metrics.num_links}`);
  console.info(`images: ${metrics.images}`);
  console.info(
    `last_fetch: ${
      metrics.last_fetch !== -1
        ? new Date(metrics.last_fetch).toLocaleString()
        : "never"
    }`,
  );
};

/**
 * Get the filename for a Response object
 *
 * @example
 *   getFilename(new Response("Hello, world!")) // => "example.com.html"
 */
const getFilename = (r: Response) => `${new URL(r.url).hostname}.html`;

/**
 * Get the timestamp of the latest fetch
 *
 * @example
 *   getLatestFetch(new Response("Hello, world!")) // => 1615892800000
 */
const getLatestFetch = (page: Response, metrics: Metrics) => {
  // check if the file already exists
  const file = Bun.file(getFilename(page));

  // if the file does not exist, we will show a message
  metrics.last_fetch = file.lastModified;
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
          const metrics: Metrics = {
            num_links: 0,
            images: 0,
            last_fetch: 0,
          };
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
