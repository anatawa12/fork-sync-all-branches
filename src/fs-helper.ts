import * as fs from "fs";
import path from "path";

export function directoryExistsSync(dir: string): void {
    let stats: fs.Stats;
    try {
        stats = fs.statSync(dir);
    } catch (error) {
        if (error.code === "ENOENT") {
            throw new Error(`Directory '${dir}' does not exist`);
        }

        throw new Error(`Encountered an error when checking whether path '${dir}' exists: ${error.message}`);
    }

    if (stats.isDirectory()) return;

    throw new Error(`Directory '${dir}' does not exist`);
}

interface AsyncIterator<T> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
    next(value?: any): Promise<IteratorResult<T>>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
    return?(value?: any): Promise<IteratorResult<T>>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
    throw?(e?: any): Promise<IteratorResult<T>>;
}

interface AsyncIterable<T> {
    [Symbol.asyncIterator](): AsyncIterator<T>;
}

interface AsyncIterableIterator<T> extends AsyncIterator<T>, AsyncIterable<T> {}

export function walkDirectory(dir: string): AsyncIterableIterator<string> {
    return walkDirectoryImpl(dir, dir);
}

async function* walkDirectoryImpl(dir: string, base: string): AsyncIterableIterator<string> {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walkDirectoryImpl(entry, base);
        else if (d.isFile()) yield path.relative(base, entry);
    }
}

export function toUnixLike(platformPath: string): string {
    if (path.sep === "/") return platformPath;
    return platformPath.replace(path.sep, "/");
}

export function fromUnixLike(unixLike: string): string {
    if (path.sep === "/") return unixLike;
    return unixLike.replace("/", path.sep);
}

export async function copyFileWithCreateParents(src: string, dst: string): Promise<void> {
    await fs.promises.mkdir(path.dirname(dst), {recursive: true});
    await fs.promises.copyFile(src, dst);
}
