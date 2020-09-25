import {IOption, Repository} from "./option";
import {main} from "./main";

function getArgv(index: number): string {
    const argv = process.argv[2 + index];
    if (!argv) throw new Error(`arg #${index} not found`);
    return argv;
}

function verifyRepositoryIdentifier(originIdentifier: string): Repository {
    const splitRepository = originIdentifier.split("/");
    if (splitRepository.length !== 2 || !splitRepository[0] || !splitRepository[1]) {
        throw new Error(`Invalid repository '${originIdentifier}'. Expected format {owner}/{repo}.`);
    }
    return {
        owner: splitRepository[0],
        repo: splitRepository[1],
    };
}

export async function readOptions(): Promise<IOption> {
    // GitHub workspace
    const githubWorkspacePath = getArgv(0);

    const github_token = getArgv(1);

    const origin = verifyRepositoryIdentifier(getArgv(2));

    const upstream = verifyRepositoryIdentifier(getArgv(3));

    const only = undefined;
    const exclude = undefined;

    if (exclude && only) throw new Error("both exclude and only cannot be used same time.");

    return {
        workspace: githubWorkspacePath,
        githubToken: github_token,
        origin,
        upstream,
        originName: "origin",
        upstreamName: "upstream",
        only,
        exclude,
    };
}

async function run(): Promise<void> {
    try {
        await main(await readOptions());
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
}

run();
