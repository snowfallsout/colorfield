import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { join } from 'node:path';

const buildPath = join(process.cwd(), 'build');
const socketBuildPath = join(process.cwd(), 'build', 'socket', 'server', 'socket.server.js');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const port = process.env.PORT || '4173';
const origin = process.env.ORIGIN || `http://127.0.0.1:${port}`;

function runBuildIfNeeded() {
	if (existsSync(buildPath) && existsSync(socketBuildPath)) return;
	console.log('No production build found. Running npm run build...');
	const result = spawnSync(npmCommand, ['run', 'build'], {
		cwd: process.cwd(),
		stdio: 'inherit',
		env: process.env
	});
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

runBuildIfNeeded();

console.log(`Starting InkLumina on ${origin}`);

const child = spawn(process.execPath, ['scripts/production-server.mjs'], {
	stdio: 'inherit',
	cwd: process.cwd(),
	env: {
		...process.env,
		HOST: process.env.HOST || '127.0.0.1',
		PORT: port,
		ORIGIN: origin
	}
});

child.on('exit', (code) => {
	process.exit(code ?? 0);
});