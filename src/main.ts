import {IOption, Repository} from "./option";
import {execCommand} from "./exec-command";
import {copyFileWithCreateParents, fromUnixLike, toUnixLike, walkDirectory} from "./fs-helper";
import * as path from "path";
import * as fs from "fs";

export async function main(options: IOption): Promise<void> {
    await initRepository(options);
    await initRemoteOrigin(options);
    await initRemoteUpstream(options);
    await shallowFetchOrigin(options);
    await fetchUpstream(options);
    const branches = await computeBranchesToCopy(options);
    await createBranchesByUpstream(options, branches);
    await setUpstreamAsOrigin(options, branches);
    await pushToOrigin(options, branches);
}

async function initRepository(options: IOption): Promise<void> {
    await execCommand("git", "init", options.workspace);
}
// buildGitUrl(options, options.origin)

function buildGitUrl(options: IOption, repo: Repository): string {
    return `https://anything:${options.githubToken}@github.com/${repo.owner}/${repo.repo}.git`;
}

async function initRemoteOrigin(options: IOption): Promise<void> {
    await execCommand(
        "git",
        "-C",
        options.workspace,
        "remote",
        "add",
        options.originName,
        buildGitUrl(options, options.origin),
    );
}

async function initRemoteUpstream(options: IOption): Promise<void> {
    await execCommand(
        "git",
        "-C",
        options.workspace,
        "remote",
        "add",
        options.upstreamName,
        buildGitUrl(options, options.upstream),
    );
}

async function shallowFetchOrigin(options: IOption): Promise<void> {
    await execCommand("git", "-C", options.workspace, "fetch", options.originName, "--depth", "1");
}

async function fetchUpstream(options: IOption): Promise<void> {
    await execCommand("git", "-C", options.workspace, "fetch", options.upstreamName);
}

async function computeBranchesToCopy(options: IOption): Promise<string[]> {
    const branches: string[] = [];
    for await (let branch of walkDirectory(
        path.join(options.workspace, ".git", "refs", "remotes", options.upstreamName),
    )) {
        branch = toUnixLike(branch);
        if (options.only && !options.only.test(branch)) continue;
        if (options.exclude && options.exclude.test(branch)) continue;
        branches.push(branch);
    }
    return branches;
}

async function createBranchesByUpstream(options: IOption, branches: string[]): Promise<void> {
    for (const branch of branches) {
        await copyFileWithCreateParents(
            path.join(options.workspace, ".git", "refs", "remotes", options.upstreamName, fromUnixLike(branch)),
            path.join(options.workspace, ".git", "refs", "heads", fromUnixLike(branch)),
        );
    }
}

async function setUpstreamAsOrigin(options: IOption, branches: string[]): Promise<void> {
    const gitConfigPath = path.join(options.workspace, ".git", "config");
    let appendText = "\n";

    for (const branch of branches) {
        appendText += `[branch "${escapeForGitConfig(branch)}"]\n`;
        appendText += `\tremote = ${options.originName}`;
        appendText += `\tmerge = refs/heads/${escapeForGitConfig(branch)}`;
    }

    await fs.promises.appendFile(gitConfigPath, appendText);
}

function escapeForGitConfig(text: string): string {
    return `${text.replace('"', '\\"')}`;
}

async function pushToOrigin(options: IOption, branches: string[]): Promise<void> {
    await execCommand("git", "-C", options.workspace, "push", options.originName, ...branches);
}
