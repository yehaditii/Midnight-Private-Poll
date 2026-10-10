import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import type { Contract as PollContract, Witnesses as PollWitnesses } from '../contracts/managed/poll/contract/index.js';
import { witnesses, type PollPrivateState } from './witnesses.js';

export const PRIVATE_STATE_ID = 'pollPrivateState';
export const PRIVATE_STATE_STORE = 'poll-private-state';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'poll');

export async function loadCompiledPoll() {
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) {
    console.error('\n❌ Contract not compiled! Run: npm run compile\n');
    process.exit(1);
  }
  const Poll = await import(pathToFileURL(contractPath).href);
  const pollWitnesses: PollWitnesses<PollPrivateState> = witnesses;
  const compiledContract = CompiledContract.make<PollContract<PollPrivateState, PollWitnesses<PollPrivateState>>>(
    'poll',
    Poll.Contract as any,
  ).pipe(
    CompiledContract.withWitnesses(pollWitnesses),
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );
  return { Poll, compiledContract };
}
