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
  localVote: ({ privateState }: { privateState: PollPrivateState }): [PollPrivateState, boolean] => [
    privateState,
    pendingVote,
  ],
};
