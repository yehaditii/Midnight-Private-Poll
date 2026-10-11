import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const version = readFileSync(path.join(root, '.compact-version'), 'utf8').trim();
const compactArgs = ['compile', `+${version}`, 'contracts/poll.compact', 'contracts/managed/poll'];

let command;
let args;

if (process.platform === 'win32') {
  const distro = process.env.MIDNIGHT_WSL_DISTRO || 'Ubuntu';
  const escapedRoot = root.replace(/'/g, "'\\''");
  const wslCommand = `cd "$(wslpath -u '${escapedRoot}')" && compact ${compactArgs.join(' ')}`;
  command = 'wsl.exe';
  args = ['-d', distro, '--', 'bash', '-lc', wslCommand];
} else {
  command = 'compact';
  args = compactArgs;
}

const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
if (result.error) {
  console.error(`Could not run the Compact compiler: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);