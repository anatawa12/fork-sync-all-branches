# Fork Sync
[![Build](https://github.com/anatawa12/fork-sync-all-branches/workflows/build-test/badge.svg)](https://github.com/anatawa12/fork-sync-all-branches/actions?workflow=build-test)
![Version](https://img.shields.io/github/v/release/tg908/fork-sync?style=flat-square)

Github action to sync your Forks.
This action syncs all branches.

# Example Workflow

```yml
name: Sync Fork

on:
  schedule:
    - cron: '*/30 * * * *' # every 30 minutes
  workflow_dispatch: # on button click

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - uses: anatawa12/fork-sync-all-branches@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

# Parameters

| name         | is optional | Default                  | description                                              |
| ---          | ----------- | ------------------------ | ---------------------------------------------------------|
| github_token | required    |                          | Token to access the Github API                           |
| origin       | optional    | ${{ github.repository }} | the repository to sync to. must be forked repository     |
| only         | optional    | (none)                   | a regex. if specified, copies only matched branches      |
| exclude      | optional    | (none)                   | a regex. if specified, copies only not matched branches. |
