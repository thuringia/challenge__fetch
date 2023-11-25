// pass user arguments to the program
// arg 1 = path to bun binary
// arg 2 = path to the current file
// we will ignore these using destructuring
const [, , ...args] = Bun.argv;

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
      const filename = `${new URL(website.value.url).hostname}.html`;
      await Bun.write(filename, website.value);
      console.info(`Saved ${website.value.url} to ${filename}`);
      break;

    case "rejected":
      console.error(
        `Failed to fetch ${website.reason.url}: ${website.reason.message}`,
      );
      break;
  }
}
