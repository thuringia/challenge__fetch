import { expect, test, beforeEach, afterEach } from "bun:test";
import {unlink} from "node:fs/promises";

beforeEach(async () => {
  await Bun.write("test.txt", "Hello, world!");
});

afterEach(async () => {
  await unlink("test.txt");
});

test("format file timestamp", () => {
    const timestamp = Bun.file("test.txt").lastModified;
    const formatted = new Date(timestamp).toLocaleString();
    console.info("Formatted timestamp:", formatted);
    expect(formatted).toBeString();

    const timestamp2 = Bun.file("test1.txt").lastModified;
    console.info("Formatted timestamp:", timestamp2);
});