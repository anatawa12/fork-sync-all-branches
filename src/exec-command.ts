import * as child_process from "child_process";

export async function execCommand(cmd: string, ...args: string[]): Promise<void> {
    return await execCommandWithExpectedCodes(cmd, args, [0]);
}

export async function execCommandWithExpectedCodes(cmd: string, args: string[], expectedCode: number[]): Promise<void> {
    const code = await execCommandImpl(cmd, args);
    if (!expectedCode.includes(code))
        throw new Error(`command returns unexpected value: ${code}: ${cmd} ${args.join(" ")}`);
}

// eslint-disable-next-line @typescript-eslint/promise-function-async
export function execCommandImpl(cmd: string, args: string[]): Promise<number> {
    // eslint-disable-next-line no-console
    console.log(`${cmd} ${args.join(" ")}`);
    return new Promise(resolve => {
        const process = child_process.spawn(cmd, args, {
            stdio: "inherit",
        });
        process.on("close", code => {
            resolve(code);
        });
    });
}
