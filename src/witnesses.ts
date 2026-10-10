import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger } from '../contracts/managed/poll/contract/index.js';

export type PollPrivateState = {
  vote: boolean;
};

export const createPollPrivateState = (vote: boolean): PollPrivateState => ({ vote });

/** Mutable vote used by the CLI for the next `castVote` proof. */
export let pendingVote = false;

export function setPendingVote(vote: boolean): void {
  pendingVote = vote;
}

export const witnesses = {
  localVote: (context: WitnessContext<Ledger, PollPrivateState>): [PollPrivateState, boolean] => [
    context.privateState,
    pendingVote,
  ],
};
