import { describe, expect, it } from 'vitest';
import { resolveNetwork } from '../src/network';

const preprodArgv = ['node', 'src/network.ts', '--network', 'preprod'];

describe('network configuration', () => {
  it('adds the Blockfrost project ID to all current Preprod endpoints', () => {
    const { config } = resolveNetwork({
      argv: preprodArgv,
      env: { MIDNIGHT_BLOCKFROST_PROJECT_ID: 'test-project-id' },
      cwd: 'unused-when-network-is-explicit',
    });

    for (const endpoint of [config.indexer, config.indexerWS, config.node]) {
      expect(new URL(endpoint).searchParams.get('project_id')).toBe('test-project-id');
    }
    expect(config.indexer).toBe('https://midnight-preprod.blockfrost.io/api/v0?project_id=test-project-id');
  });

  it('requires credentials or explicit endpoint overrides for Preprod', () => {
    expect(() => resolveNetwork({
      argv: preprodArgv,
      env: {},
      cwd: 'unused-when-network-is-explicit',
    })).toThrow(/Preprod requires MIDNIGHT_BLOCKFROST_PROJECT_ID/);
  });

  it('does not require a Blockfrost project ID for Preview', () => {
    const { config } = resolveNetwork({
      argv: ['node', 'src/network.ts', '--network', 'preview'],
      env: {},
      cwd: 'unused-when-network-is-explicit',
    });

    expect(config.indexer).toBe('https://indexer.preview.midnight.network/api/v4/graphql');
  });
});