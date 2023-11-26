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

## Build with Docker
To build the tool inside a container as a clean environment run:
```bash
# build the image
docker build -t fetch .
 
# run container to get assetts
docker run -d --name fetch-build fetch 

# extract the binary
docker cp fetch-build:/home/bun/app/fetch .

# stop container
docker stop fetch-build
```

## Run the tool
To compile the tool run:
```bash
bun install
bun run compile
```
you will find a binary `fetch` now in your project directory.

### Fetching websites

```bash
fetch github.com apple.com
```
will download these 2 websites to the local directory as `github-.com.html` and `apple.com.html`.
You can pass any valid `URL` string, including parameters. If you leave out the protocol, e.g. `https://` we will prepend your input with `https://`. Should there be an error in your URL, you will receive a message like this:

```bash
bun index.ts "?auth=123"
Fetching the following websites: ?auth=123
15 |     // if not, try to prepend the protocol
16 |     try {
17 |       return new URL(`https://${url}`);
18 |     } catch (error) {
19 |       // if that fails, throw an error
20 |       throw new Error(
                ^
error: ?auth=123 is not a valid URL, and could not be expanded into one. Please check and try again.
```
If you provide a valid URL but the native `fetch` function cannot handle it, you will be shown the relevant message:
```bash
bun index.ts x://
Fetching the following websites: x://
Failed to fetch undefined: protocol must be http: or https:
```

### Show metadata about websites

If you pass the flag `--metadata` to `fetch`, you will receive a number of statistics after the site was fetched:

```bash
╰─ bun index.ts --metadata github.com
Fetching the following websites: github.com
Successfully fetched https://github.com/
Saved https://github.com/ to github.com.html
site: https://github.com/
last_fetch: 11/26/2023, 11:41:59 AM
```

`last_fetch` uses the `lastModified` date of the HTML file, that way we do not have to track this value in a separate file or other data store. However, it will be unreliable if you modify files outside of `fetch`, e.g. with you editor, or the terminal.
The current assumption is, that this is an acceptable tradeoff, that keeps `fetch` accurate enough but also does not introduce more complexity than needed. It is fairly easy to extend `fetch` with data persistence using the built-in [`bun:sqlite`](https://bun.sh/docs/api/sqlite) module

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