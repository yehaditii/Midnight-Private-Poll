import { describe, expect, it } from 'vitest';
import * as RT from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger } from '../contracts/managed/poll/contract/index.js';

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
  it('initializes with an open poll and zero public counters', () => {
    const { context } = setup(true);
    const state = ledger(context.currentQueryContext.state);

    expect(state.isOpen).toBe(true);
    expect(state.yesVotes).toBe(0n);
    expect(state.noVotes).toBe(0n);
  });

  it('counts a private YES vote in public yesVotes', () => {
    const { contract, context } = setup(true);
    const result = contract.impureCircuits.castVote(context);
    const state = ledger(result.context.currentQueryContext.state);

    expect(state.yesVotes).toBe(1n);
    expect(state.noVotes).toBe(0n);
    expect(state.isOpen).toBe(true);
  });

  it('counts a private NO vote in public noVotes', () => {
    const { contract, context } = setup(false);
    const result = contract.impureCircuits.castVote(context);
    const state = ledger(result.context.currentQueryContext.state);

    expect(state.yesVotes).toBe(0n);
    expect(state.noVotes).toBe(1n);
  });

  it('accumulates mixed YES and NO votes in public aggregates', () => {
    const { contract, context } = setup(true);
    const yes = contract.impureCircuits.castVote(context);
    const afterYes = ledger(yes.context.currentQueryContext.state);
    expect(afterYes.yesVotes).toBe(1n);
    expect(afterYes.noVotes).toBe(0n);

    const noContext = RT.createCircuitContext(
      ADDRESS,
      COIN,
      yes.context.currentQueryContext.state,
      {},
    );
    const noContract = new Contract({
      localVote: () => [{}, false],
    });
    const no = noContract.impureCircuits.castVote(noContext);
    const afterNo = ledger(no.context.currentQueryContext.state);

    expect(afterNo.yesVotes).toBe(1n);
    expect(afterNo.noVotes).toBe(1n);
  });

  it('rejects votes after the poll is closed', () => {
    const { contract, context } = setup(true);
    const closed = contract.impureCircuits.closePoll(context);
    const closedState = ledger(closed.context.currentQueryContext.state);
    expect(closedState.isOpen).toBe(false);

    const voteContext = RT.createCircuitContext(
      ADDRESS,
      COIN,
      closed.context.currentQueryContext.state,
      {},
    );
    expect(() => contract.impureCircuits.castVote(voteContext)).toThrow(/Poll is closed/);
  });

  it('rejects closing an already closed poll', () => {
    const { contract, context } = setup(true);
    const closed = contract.impureCircuits.closePoll(context);
    const again = RT.createCircuitContext(
      ADDRESS,
      COIN,
      closed.context.currentQueryContext.state,
      {},
    );
    expect(() => contract.impureCircuits.closePoll(again)).toThrow(/already closed/);
  });

  it('uses disclose() so the private Boolean can update public counters', () => {
    // Compact requires disclose(vote) before the witness Boolean may
    // influence which ledger Counter is incremented. The proof still
    // does not store the Boolean as a named ledger field.
    const { contract, context } = setup(true);
    const result = contract.impureCircuits.castVote(context);
    const state = ledger(result.context.currentQueryContext.state);
    const publicKeys = Object.keys(state).sort();

    expect(publicKeys).toEqual(['isOpen', 'noVotes', 'yesVotes']);
    expect(state).not.toHaveProperty('localVote');
    expect(state).not.toHaveProperty('vote');
  });
});
