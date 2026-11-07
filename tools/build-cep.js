#!/usr/bin/env node
/*
---------------------------------------------------------------
> PROMO GNEWS · CEP build / dev install
---------------------------------------------------------------

  node tools/build-cep.js
      → dist/com.promognews.cep  (self-contained extension folder:
        cep/* + the classic sources copied into host/src)

  node tools/build-cep.js --dev
      → links 'source' into cep/host/src and links the 'cep' folder
        into the user's CEP extensions folder, so edits are live
        (reload the panel to see client changes; reopen AE for host changes).
        unsigned extensions also need PlayerDebugMode (see cep/README.md).
*/
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const CEP = path.join(ROOT, 'cep');
const SRC = path.join(ROOT, 'source');
const ID = 'com.promognews.cep';
const SRC_PARTS = ['globals.js', 'libraries', 'layout'];

function copy(from, to) {
	const st = fs.statSync(from);
	if (st.isDirectory()) {
		fs.mkdirSync(to, { recursive: true });
		for (const f of fs.readdirSync(from)) {
			if (f === 'Thumbs.db' || f === '.DS_Store' || f.startsWith('@')) continue;
			copy(path.join(from, f), path.join(to, f));
		}
	} else {
		fs.mkdirSync(path.dirname(to), { recursive: true });
		fs.copyFileSync(from, to);
	}
}

function link(target, at) {
	let st = null;
	try { st = fs.lstatSync(at); } catch (e) { /* nothing there */ }
	if (st && st.isSymbolicLink()) fs.unlinkSync(at);
	else if (st) {
		// a real folder is there: never delete it, ask the user to move it
		console.error('already exists (not a link): ' + at + '\nremove or rename it and run again.');
		process.exit(1);
	}
	fs.mkdirSync(path.dirname(at), { recursive: true });
	fs.symlinkSync(target, at, process.platform === 'win32' ? 'junction' : 'dir');
}

function extensionsFolder() {
	if (process.platform === 'win32') return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Adobe', 'CEP', 'extensions');
	return path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'CEP', 'extensions');
}

if (process.argv.includes('--dev')) {
	link(SRC, path.join(CEP, 'host', 'src'));
	const dest = path.join(extensionsFolder(), ID);
	link(CEP, dest);
	console.log('linked  source → cep/host/src');
	console.log('linked  cep    → ' + dest);
	console.log('\nenable unsigned extensions once (CSXS 11):');
	console.log(process.platform === 'win32'
		? '  reg add HKCU\\Software\\Adobe\\CSXS.11 /v PlayerDebugMode /t REG_SZ /d 1 /f'
		: '  defaults write com.adobe.CSXS.11 PlayerDebugMode 1');
	console.log('then restart After Effects → Window › Extensions › PROMO GNEWS');
	process.exit(0);
}

const out = path.join(ROOT, 'dist', ID);
fs.rmSync(out, { recursive: true, force: true });
copy(CEP, out);
// never ship the dev link
fs.rmSync(path.join(out, 'host', 'src'), { recursive: true, force: true });
fs.rmSync(path.join(out, 'README.md'), { force: true });
for (const part of SRC_PARTS) copy(path.join(SRC, part), path.join(out, 'host', 'src', part));
console.log('built → ' + path.relative(ROOT, out));
console.log('sign with ZXPSignCmd to distribute as .zxp, or copy the folder to the CEP extensions folder (needs PlayerDebugMode).');
