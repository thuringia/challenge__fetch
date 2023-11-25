// pass user arguments to the program
// arg 1 = path to bun binary
// arg 2 = path to the current file
// we will ignore these using destructuring
const [,,...args] = Bun.argv;

console.info("Fetching the following websites:", args.join(", "));
