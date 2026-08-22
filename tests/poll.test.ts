import { describe, expect, it } from 'vitest';
import * as RT from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger } from '../contracts/managed/hello-world/contract/index.js';

const COIN = '0'.repeat(64);
const ADDRESS = RT.sampleContractAddress();

const setup = (vote: boolean) => {
  const contract = new Contract({
    localVote: () => [{}, vote],
  });
  const constructor = contract.initialState(RT.createConstructorContext({}, COIN));
  const context = RT.createCircuitContext(
    ADDRESS,
    COIN,
    constructor.currentContractState,
    {},
  );
  return { contract, context };
};

describe('Midnight Private Poll', () => {
  it('starts with empty public counters', () => {
    const { context } = setup(true);
    const state = ledger(context.currentQueryContext.state);

    expect(state.yesVotes).toBe(0n);
    expect(state.totalVotes).toBe(0n);
  });

  it('counts a private YES vote in public state', () => {
    const { contract, context } = setup(true);
    const result = contract.impureCircuits.castVote(context);
    const state = ledger(result.context.currentQueryContext.state);

    expect(state.yesVotes).toBe(1n);
    expect(state.totalVotes).toBe(1n);
  });

  it('counts a private NO vote without exposing it in the ledger', () => {
    const { contract, context } = setup(false);
    const result = contract.impureCircuits.castVote(context);
    const state = ledger(result.context.currentQueryContext.state);

    expect(state.yesVotes).toBe(0n);
    expect(state.totalVotes).toBe(1n);
  });
});
