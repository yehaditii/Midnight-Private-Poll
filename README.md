# Midnight Private Poll

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Midnight](https://img.shields.io/badge/Midnight-Compact%20SDK-0F172A?logo=zkp&logoColor=white)](https://midnight.network/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A minimal Midnight Network contract that models a private YES/NO poll using a Compact circuit, witness-backed voting, and public ledger counters. The project demonstrates how a private Boolean can influence public state without storing the raw vote as a named ledger field.

## Overview

This repository contains a Compact contract and TypeScript helper scripts for:

- initializing a poll state
- verifying the public `yesVotes` and `noVotes` counters
- closing the poll
- proving a private vote with a local witness
- deploying the compiled contract to local or public Midnight environments

The implementation intentionally keeps the design small and explicit: the public state is readable, while the private vote remains in the witness layer unless `disclose()` is used to allow the Boolean to affect a public counter.

## Key features

- Compact contract with public ledger state: `yesVotes`, `noVotes`, and `isOpen`
- Private witness-based vote input through `localVote()`
- Intentional use of `disclose(vote)` to let a private decision update public counters
- TypeScript wrappers for contract compilation and deployment
- Local devnet support via Docker Compose
- Unit tests covering initialization, vote counting, aggregate tracking, and poll closure rules

## Tech stack

- Midnight Network Compact language
- Midnight.js 4.1.x runtime and contracts
- TypeScript + Node.js 22
- Vitest for unit testing
- Docker Compose for proof-server and local devnet services
- LevelDB-backed private state provider

## Project structure

```text
.
├── contracts/
│   ├── poll.compact
│   └── managed/
│       └── poll/
│           ├── compiler/
│           ├── contract/
│           ├── keys/
│           └── zkir/
├── scripts/
│   └── e2e-check.ts
├── src/
│   ├── check-balance.ts
│   ├── cli.ts
│   ├── compiled-contract.ts
│   ├── deploy.ts
│   ├── network.ts
│   ├── setup.ts
│   ├── wallet-state.ts
│   ├── wallet.ts
│   └── witnesses.ts
├── tests/
│   └── poll.test.ts
├── .compact-version
├── .env.example
├── .gitignore
├── .midnight-state.json
├── docker-compose.yml
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── screenshots/
│   ├── compile-output.png
│   └── test-output.png
└── LICENSE
```

## Prerequisites

- Node.js 22+
- npm 10+
- Docker Desktop with Compose v2
- Midnight Compact CLI matching the pinned toolchain version in `.compact-version`
- Git
- Optional: WSL2/Ubuntu if you prefer a Unix-like shell on Windows

## Installation

```bash
git clone https://github.com/yehaditii/Midnight-Private-Poll.git
cd Midnight-Private-Poll
npm install
```

If you need the Compact compiler locally:

```bash
compact --version
compact compile --version
```

## Configuration

This project uses environment-variable overrides in [src/network.ts](src/network.ts) and a safe example file in [.env.example](.env.example). Copy the example file to `.env` only when needed, and never commit real secrets.

Example:

```bash
cp .env.example .env
```

The following variables are supported:

- `MIDNIGHT_INDEXER_URL`
- `MIDNIGHT_INDEXER_WS_URL`
- `MIDNIGHT_NODE_URL`
- `MIDNIGHT_PROOF_SERVER_URL`
- `MIDNIGHT_FAUCET_URL`
- `MIDNIGHT_WALLET_SEED`
- `MIDNIGHT_WALLET_MNEMONIC`
- `PRIVATE_STATE_PASSWORD`

The repository already ignores wallet and local runtime state files through `.gitignore`.

## Running the project

### Compile the contract

```bash
npm run compile
```

### Run the unit tests

```bash
npm test
```

### Start the local proof server and devnet

```bash
docker compose up -d --wait
```

### Start the local CLI for manual interactions

```bash
npm run cli
```

### Deploy to the local or public network

```bash
npm run setup
```

For public Preview or Preprod networks:

```bash
npm run setup -- --network preview
# or
npm run setup -- --network preprod
```

> Deployment is environment-dependent. A working Docker engine must be running before the proof server and contract deployment can proceed.

## Usage examples

### Example: create a vote transaction via the CLI

```bash
npm run cli
```

Then choose the poll actions in the console to:

- read the current public poll state
- cast a YES or NO vote
- close the poll

### Example: check wallet balance

```bash
npm run check-balance
```

## Privacy model

The design intentionally separates public state from private witness data.

- `yesVotes` and `noVotes` are public ledger values.
- `isOpen` is public ledger state.
- `localVote()` is a private witness supplied by the DApp.
- `disclose(vote)` is used so the private Boolean can influence the correct public counter without storing the raw vote as a ledger field.

This means the public state is visible and auditable, while the individual vote remains private at the witness layer. The limitation is that the public counter deltas are still observable by anyone watching chain activity.

## Screenshots

These screenshots are generated from the project’s actual local output and saved in the repository under the `screenshots/` directory.

### Compile output

![Compile output](screenshots/compile-output.png)

Caption: successful `npm run compile` output showing the Compact compiler generating the managed contract artifacts.

### Test output

![Test output](screenshots/test-output.png)

Caption: successful `npm test` output verifying the contract logic and privacy behavior.

## Development notes

The main contract lives in [contracts/poll.compact](contracts/poll.compact). The generated artifacts in [contracts/managed/poll](contracts/managed/poll) are compiler output and should not be edited by hand.

Relevant TypeScript entry points:

- [src/deploy.ts](src/deploy.ts) — deployment logic
- [src/network.ts](src/network.ts) — network and wallet configuration
- [src/witnesses.ts](src/witnesses.ts) — local vote witness implementation
- [src/compiled-contract.ts](src/compiled-contract.ts) — compiled contract binding
- [tests/poll.test.ts](tests/poll.test.ts) — contract behavior tests

## Contributing

Contributions are welcome if they preserve the current functionality and improve documentation, correctness, or maintainability.

1. Fork the repository.
2. Create a topic branch.
3. Make a focused change.
4. Run the relevant validation commands.
5. Open a pull request with a clear description of the change.

Do not submit secrets, private keys, wallet mnemonics, or real environment values in pull requests.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Previewing the README locally

Open the repository in a Markdown viewer or use a GitHub-style preview extension in VS Code.

## Commit and push workflow

When you are ready to publish changes, use a meaningful commit message such as:

```bash
git add README.md .env.example screenshots
git commit -m "docs: improve README and add project screenshots"
git push origin main
```

This repository is already configured with the existing remote, so the push target is the current GitHub project. Do not run destructive commands such as `git reset --hard`, `git clean -fd`, or a force push unless you explicitly confirm that action.
