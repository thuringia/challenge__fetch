import { fetchWebsites } from "./fetcher";
import { startServer } from "./server";

/**
 * Parse the user arguments
 *
 * If the user passes `--metadata` as argument,
 * we will show metadata about the fetch.
 *
 * If the user passes `--server` as  argument,
 * we will start a HTTP server.
 */
const parseArguments = () => {
  // pass user arguments to the program
  // arg 1 = path to bun binary
  // arg 2 = path to the current file
  // we will ignore these using destructuring
  const [, , flag1, flag2, ...argv] = Bun.argv;

  // detect if we should show metadata, or start a server
  const showMetadata = [flag1, flag2].includes("--metadata");
  const startServer = [flag1, flag2].includes("--server");

  // if we should not show metadata, use the original arguments, else the remaining arguments
  const pages = [...[flag1, flag2].filter((x) => !x.startsWith("--")), ...argv];

  return { showMetadata, startServer, pages };
};

const args = parseArguments();

await fetchWebsites(args.pages, args.showMetadata);

if (args.startServer) {
  startServer();
}
