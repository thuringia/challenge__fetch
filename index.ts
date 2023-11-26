const getFilename = (r: Response) => `${new URL(r.url).hostname}.html`;

/**
 * A function to collect metadata about a page using HTMLRewriter
 * @param page 
 * @example
 *   site: www.google.com
 *   num_links: 35
 *   images: 3
 *   last_fetch: Tue Mar 16 2021 15:46 UTC
 */
const collectPageMetadata = async (page: Response) => {
// check if the file already exists
const file = Bun.file(getFilename(page));
const exists = await file.exists();

// if the file does not exist, we will show a message
const lastUpdated = exists ? new Date(file.lastModified).toLocaleString() : "never";

// collect the metadata

// print the metadata
// console.table currently doest not work in Bun, so we use console.info
console.info(`site: ${page.url}`);
//console.info(`num_links: ${numLinks}`);
//console.info(`images: ${numImages}`);
console.info(`last_fetch: ${lastUpdated}`);
}

// pass user arguments to the program
// arg 1 = path to bun binary
// arg 2 = path to the current file
// we will ignore these using destructuring
const [, , metadata, ...argv] = Bun.argv;

// detect if we should show metadata about the fetch
const showMetadata = metadata === "--metadata";

// if we should not show metadata, use the original arguments, else the remaining arguments
const args = showMetadata ? argv : [metadata, ...argv];


console.info("Fetching the following websites:", args.join(", "));

// prepare URLs
const urls = args.map((url) => {
  // if the user provided a valid URL, use it
  try {
    return new URL(url);
  } catch (error) {
    // if not, try to prepend the protocol
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

// fetch the websites and collect possible errors
const websites = await Promise.allSettled(urls.map((url) => fetch(url)));

// report if fetching was successful, then save the HTML
for (const website of websites) {
  switch (website.status) {
    case "fulfilled":
      console.info(`Successfully fetched ${website.value.url}`);
      const filename = getFilename(website.value);
      await Bun.write(filename, website.value);
      console.info(`Saved ${website.value.url} to ${filename}`);
      if (showMetadata) {
        await collectPageMetadata(website.value);
      }
      break;

    case "rejected":
      console.error(
        `Failed to fetch ${website.reason.url}: ${website.reason.message}`,
      );
      break;
  }
}
