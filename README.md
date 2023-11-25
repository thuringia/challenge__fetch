# fetcher

This tool allows you to download web sites, like `curl` or `wget` but using only Javascript.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.14. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Design

This project uses the [Bun](https://bun.sh) runtime. Compared to Node.js, this runtime uses the JSC Javascript engine from WebKit/Safari, not V8. It is similar in goals and features to the [Deno](https://deno.com) runtime, however it provides much better compatibility with normal Node.js libraries and packaging concepts. 

For this project Bun is ideal, as it provides a complete system from built-in Typescript support to bundling and creating [standalone binaries](https://bun.sh/docs/bundler/executables).

This tools consists of 3 steps:
1. Receiving instructions on which websites to download from the user using command line arguments
2. Downloading these websites to the local file system
3. Processing the received HTML files to extract metadata