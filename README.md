# Midnight Private Poll

## Overview

Midnight Private Poll is a minimal YES/NO Compact contract on the Midnight Network. It shows how a private vote can be supplied through a local witness, proven in a zero-knowledge circuit, and used to update public aggregate tallies without storing the individual Boolean as a named ledger field.

The project is based on the current `create-mn-app` hello-world scaffold (Midnight.js 4.1.x, Compact language `>= 0.23`) and replaces the sample message contract with a small poll.

## Privacy Model

Compact treats witness data as private by default. A value derived from a witness may not cross a **visibility boundary** (ledger write, exported circuit return, or contract-to-contract call) unless the program wraps it in `disclose()`.

This contract uses that rule on purpose:

- `localVote()` is a **private witness**. The DApp provides the YES/NO bit on the user's machine. It is not a ledger field.
- `yesVotes`, `noVotes`, and `isOpen` are **public ledger** state. Anyone can read them from the chain.
- `disclose(vote)` is required because the witness Boolean decides which public counter is incremented. `disclose()` itself does not publish a value; it tells the compiler that this witness-derived Boolean is allowed to influence public state.
- The individual vote is **not stored** as `vote` on the ledger. The public effect of a vote is a counter increment.
- **Honest limitation:** if an observer watches each transaction and compares public counters before and after, they can infer whether that transaction incremented YES or NO. Aggregates are public; per-transaction deltas of those aggregates are also public. What stays off-ledger is the witness callback and the fact that Compact does not emit a named `vote` field.

## Architecture

| Piece | Role |
|---|---|
| `contracts/poll.compact` | Compact source: constructor, `castVote`, `closePoll` |
| `contracts/managed/poll/` | Compiler output: JS bindings, ZKIR, proving/verifying keys |
| `src/witnesses.ts` | TypeScript implementation of `localVote` |
| `src/deploy.ts` | Deploy to local devnet, Preview, or Preprod |
| `src/cli.ts` | Cast a vote, read tallies, close the poll |
| `tests/poll.test.ts` | Compact-runtime unit tests (no chain required) |

## Prerequisites

- Node.js 22+
- npm 10+
- Docker Desktop with Compose v2 (Linux engine)
- Compact compiler (`compact` CLI) matching language `>= 0.23`
- Git
- On Windows: WSL2/Ubuntu is useful if the Compact installer is Unix-only

Install Compact from current Midnight docs:

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
compact update
compact --version
compact compile --version
```

## Installation

```bash
git clone https://github.com/yehaditii/Midnight-Private-Poll.git
cd Midnight-Private-Poll
npm install
```

## Verified Local Status

The current codebase is verified in this workspace with the project’s actual commands:

```bash
npm run compile
npm test
```

Results from the current checkout:
- `npm run compile` succeeds and regenerates the managed artifacts under `contracts/managed/poll/`.
- `npm test` passes: 7/7 tests passing.
- Deployment and proof-server startup are blocked until Docker Desktop / the Docker engine is running locally.

## Running Locally

Start the bundled undeployed devnet (node, indexer, proof-server), compile, and deploy:

```bash
npm run setup
```

Then:

```bash
npm run cli
npm run check-balance
```

Proof server only:

```bash
npm run proof-server:start
npm run proof-server:stop
```

Tear down the local chain:

```bash
docker compose down -v
```

## Compile

```bash
npm run compile
```

This runs:

```bash
compact compile contracts/poll.compact contracts/managed/poll
```

Success writes TypeScript/JS bindings plus circuit artifacts under `contracts/managed/poll/`.

## Test

Unit tests (after a successful compile):

```bash
npm test
```

Optional read-back against a live deployment:

```bash
npm run test:e2e
```

## Generated Artifacts

`contracts/managed/poll/` is Compact compiler output, not hand-written code. Typical contents:

- `contract/` — JS/TS contract class and `ledger()` decoder
- `keys/` — proving/verifying keys
- `zkir/` — circuit IR used by the proof server

Do not edit these files. Re-run `npm run compile` after changing `poll.compact`.

## Deployment

### Local undeployed (default)

Uses the well-known genesis seed. **Do not use that seed on Preview, Preprod, or mainnet.**

```bash
npm run setup
```

### Preview or Preprod

Network URLs come from `src/network.ts` (official Preview/Preprod indexer, RPC, and faucet hosts). Do not invent RPC URLs.

```bash
npm run setup -- --network preview
# or
npm run setup -- --network preprod
```

On first public-network run the scripts generate a 24-word BIP-39 phrase, print it once, and store it in `.midnight-state.json` (gitignored). Fund the printed address from the faucet shown in the logs:

- Preview: `https://midnight-tmnight-preview.nethermind.dev`
- Preprod: `https://midnight-tmnight-preprod.nethermind.dev`

The setup script waits for tNIGHT, registers NIGHT for DUST, then deploys.

Optional env overrides (see `src/network.ts`): `MIDNIGHT_WALLET_SEED`, `MIDNIGHT_WALLET_MNEMONIC`, `MIDNIGHT_PROOF_SERVER_URL`, faucet/indexer/node URLs.

Public proof server example (Preview): `https://lace-proof-pub.preview.midnight.network`

## Deployed Contract

Status: deployment is not yet verified in this workspace because the Docker daemon is unavailable.

Network: pending local Docker Desktop startup and proof-server availability

Contract Address: pending real Preview/Preprod deployment

Do not treat local undeployed addresses as the Level 1 public-network address.

## Public State vs Private Witness

| Item | Where it lives | Who can see it |
|---|---|---|
| `yesVotes` | Public ledger | Anyone reading contract state |
| `noVotes` | Public ledger | Anyone reading contract state |
| `isOpen` | Public ledger | Anyone reading contract state |
| `localVote()` YES/NO bit | Private witness (DApp) | The proving user; not a ledger field |
| `disclose(vote)` | Compiler annotation | Allows the bit to choose which counter updates |
| Per-tx counter delta | Public ledger history | Inferable by watching each transaction |

## Initial Product Idea

Midnight Private Poll is a privacy-first polling application where users can participate in polls without storing each individual choice as a named public field. A private witness supplies the YES/NO bit on the user's machine; the circuit proves a valid vote and updates verifiable public tallies. `disclose()` is used only so that witness-derived control flow may touch those public counters — the smallest disclosure Compact requires for this design — while unused private material never crosses a visibility boundary.

## Level 1 Checklist

- [x] Toolchain installed (Node 22, Docker, Compact)
- [x] Compact contract written
- [x] Contract compiles
- [x] Tests pass
- [x] managed/ generated
- [ ] Contract deployed (blocked until Docker Desktop is running)
- [ ] Contract address documented (pending real deploy)
- [x] README completed (with verified local status and deployment blocker noted)
- [x] 5 meaningful commits in the repository history
