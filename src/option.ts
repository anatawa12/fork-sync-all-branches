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

    only: string[] | undefined;
    exclude: string[] | undefined;
}
