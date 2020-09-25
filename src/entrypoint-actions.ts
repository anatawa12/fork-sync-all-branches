import {IOption, Repository} from "./option";
import * as core from "@actions/core";
import {main} from "./main";
import path from "path";
import {directoryExistsSync} from "./fs-helper";
import * as github from "@actions/github";

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
    let githubWorkspacePath = process.env["GITHUB_WORKSPACE"];
    if (!githubWorkspacePath) {
        throw new Error("GITHUB_WORKSPACE not defined");
    }
    githubWorkspacePath = path.resolve(githubWorkspacePath);
    core.debug(`GITHUB_WORKSPACE = '${githubWorkspacePath}'`);
    directoryExistsSync(githubWorkspacePath);

    const github_token = core.getInput("github_token", {required: true});

    const originIdentifier = core.getInput("origin") || `${github.context.repo.owner}/${github.context.repo.repo}`;
    const origin = verifyRepositoryIdentifier(originIdentifier);

    const octokit = github.getOctokit(github_token);
    const originRepo = await octokit.repos.get({
        owner: origin.owner,
        repo: origin.repo,
    });
    if (!originRepo.data.fork) throw new Error(`Invalid repository '${originIdentifier}'. Expected forked repository.`);
    const upstreamRepo = originRepo.data.parent;
    const upstream: Repository = {
        owner: upstreamRepo.owner.login,
        repo: upstreamRepo.name,
    };

    const only = core.getInput("only")?.split("\n");
    const exclude = core.getInput("exclude")?.split("\n");

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
        core.setFailed(error.message);
    }
}

run();
