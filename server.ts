import { Glob } from "bun";

// create a glob to match all html files in the current working directory
const glob = new Glob("*.html");

/**
 * Start a HTTP server
 *
 * runs on $BUN_PORT, $PORT, $NODE_PORT otherwise 3000
 */
export const startServer = () => {
  const server = Bun.serve({
    fetch(req) {
      const url = new URL(req.url);

      // remove leading slash
      const filename = url.pathname.substring(1);

      // if the file exists, return it from file system
      if (glob.match(filename))
        return new Response(Bun.file(filename).stream());

      // if not found, return 404
      return new Response("404! The file has not been fetched", {
        status: 404,
      });
    },
  });
  console.info(`Started server on http://localhost:${server.port}`);
};
