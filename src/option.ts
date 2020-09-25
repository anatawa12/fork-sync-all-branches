export interface Repository {
    owner: string;
    repo: string;
}

export interface IOption {
    workspace: string;
    githubToken: string;

    origin: Repository;
    upstream: Repository;
    originName: string;
    upstreamName: string;

    only: RegExp | undefined;
    exclude: RegExp | undefined;
}
