# fetcher

This tool allows you to download web sites, like `curl` or `wget` but using only Javascript.

To install dependencies:

[Install Bun](https://bun.sh/docs/installation) if you don't have it installed, then run:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.14. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Run the tool
To compile the tool run:
```bash
bun install
bun run compile
```
you will find a binary `fetch` now in your project directory.

```bash
fetch github.com apple.com
```
will download these 2 websites to the local directory.

## Design

This project uses the [Bun](https://bun.sh) runtime. Compared to Node.js, this runtime uses the JSC Javascript engine from WebKit/Safari, not V8. It is similar in goals and features to the [Deno](https://deno.com) runtime, however it provides much better compatibility with normal Node.js libraries and packaging concepts. 

For this project Bun is ideal, as it provides a complete system from built-in Typescript support to bundling and creating [standalone binaries](https://bun.sh/docs/bundler/executables).

This tools consists of 3 steps:
1. Receiving instructions on which websites to download from the user using command line arguments
2. Downloading these websites to the local file system
3. Processing the received HTML files to extract metadata

### Dependencies
#### Typescript 
This project depends on Typescript for type checking, auto-complete and, obviously, the type system itself.
The version is soft-pinned to `~5.3.0` in `package.json`, even though our lockfile ensures that everyone receives the same version. The pinning is for documentation purposes to make sure, that everyone knows which version, and which features of Typescript are availble.
It also prevents surprises when running update commands like `bun update` as these update to the latest version in the range. Due do Typescript not practicing Semver, this could introduce issues, when the behavior of the compiler changes in unexpected ways.