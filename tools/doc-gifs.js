#!/usr/bin/env node
/*
---------------------------------------------------------------
> PROMO GNEWS · documentation gifs
---------------------------------------------------------------
  records the UI in action (pages open in the browser, host calls
  simulated by PGN.mock) and converts the videos with ffmpeg:
    images/doc/gifs/<name>.gif
  a small cursor is drawn on the page (headless video has none).

  usage:  node tools/doc-gifs.js [name ...]     (needs playwright + ffmpeg)
*/
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'images/doc/gifs');
const URL = (p) => 'file://' + path.join(ROOT, 'cep/client', p);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'pgn-gif-'));

// cursor drawn by the page itself
const CURSOR = `(() => {
	const c = document.createElement('div');
	c.style.cssText = 'position:fixed;left:-40px;top:-40px;width:14px;height:20px;z-index:2147483647;pointer-events:none;transition:transform .08s;' +
		'background:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 14 20%27%3E%3Cpath d=%27M1 1v15l4-4 3 7 3-1.4-3-6.6h5.5z%27 fill=%27white%27 stroke=%27black%27 stroke-width=%271.2%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E") no-repeat';
	const put = (e) => { c.style.left = e.clientX - 1 + 'px'; c.style.top = e.clientY - 1 + 'px'; };
	addEventListener('mousemove', put, true);
	addEventListener('mousedown', () => { c.style.transform = 'scale(.82)'; }, true);
	addEventListener('mouseup', () => { c.style.transform = ''; }, true);
	addEventListener('DOMContentLoaded', () => document.documentElement.appendChild(c));
})();`;

async function glide(p, from, to, ms) {
	const steps = Math.max(2, Math.round(ms / 16));
	for (let i = 1; i <= steps; i++) {
		const t = i / steps, e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
		await p.mouse.move(from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e);
		await p.waitForTimeout(16);
	}
	return to;
}
async function center(p, sel) {
	const el = typeof sel === 'string' ? await p.$(sel) : sel;
	const b = await el.boundingBox();
	return [b.x + b.width / 2, b.y + b.height / 2];
}
// a click that re-reads the target right before clicking (layouts move while sections open / scroll)
async function tap(p, from, get) {
	const el0 = await get();
	await el0.evaluate((e) => e.scrollIntoView({ block: 'nearest' }));
	await p.waitForTimeout(150);
	let to = await center(p, await get());
	await glide(p, from, to, 420);
	await p.waitForTimeout(120);
	to = await center(p, await get());
	await p.mouse.move(to[0], to[1]);
	await p.mouse.down(); await p.mouse.up();
	return to;
}
async function sec(p, name) {
	for (const s of await p.$$('#sections .sec .k')) if ((await s.getAttribute('aria-label')) === name) return s;
}

const SCENES = {
	// panel opening (GNEWS logo) and a section opening, horizontal bar
	abertura: { w: 640, h: 104, url: 'panel/index.html', async run(p) {
		await p.waitForTimeout(2700);
		let m = await glide(p, [600, 90], await center(p, await sec(p, 'Animação')), 500);
		await p.mouse.down(); await p.mouse.up();
		await p.waitForTimeout(700);
		const tiles = await p.$$('#sections .sec.open .t');
		m = await glide(p, m, await center(p, tiles[2]), 450);
		await p.waitForTimeout(900);
		m = await glide(p, m, await center(p, tiles[5]), 400);
		await p.waitForTimeout(1100);
	} },
	// the accordion, vertical bar with labels
	sanfona: { w: 230, h: 470, url: 'panel/index.html', async run(p) {
		await p.waitForTimeout(2700);
		let m = [200, 440];
		for (const name of ['Controles', 'Texto', 'Projeto']) {
			m = await tap(p, m, () => sec(p, name));
			await p.waitForTimeout(1100);
		}
		// a long task: progress on the tile, footer line and selection chip
		m = await tap(p, m, async () => (await p.$$('#sections .sec.open .t'))[2]);
		await p.waitForTimeout(2600);
	} },
	// hover on the logo: the official animation follows the mouse
	logo: { w: 560, h: 56, url: 'panel/index.html', async run(p) {
		await p.waitForTimeout(2700);
		const b = await (await p.$('#logo')).boundingBox();
		const y = b.y + b.height / 2;
		let m = await glide(p, [b.x + b.width + 40, y], [b.x + b.width - 6, y], 300);
		m = await glide(p, m, [b.x + 4, y], 1600);
		m = await glide(p, m, [b.x + b.width - 6, y], 1400);
		m = await glide(p, m, [b.x + b.width * .45, y], 800);
		await p.waitForTimeout(500);
	} },
	// labels: cascade between swatches, color tile and brightness
	labels: { w: 340, h: 390, url: 'windows/labels/index.html', async run(p) {
		await p.waitForTimeout(900);
		const sw = await p.$$('.sw');
		let m = [300, 380];
		for (const i of [5, 11, 2]) { m = await glide(p, m, await center(p, sw[i]), 380); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(650); }
		const t = await (await p.$('#tile')).boundingBox();
		m = await glide(p, m, [t.x + t.width / 2, t.y + t.height / 2], 350);
		await p.mouse.down();
		m = await glide(p, m, [t.x + t.width * .8, t.y + t.height * .25], 700);
		m = await glide(p, m, [t.x + t.width * .3, t.y + t.height * .2], 600);
		await p.mouse.up();
		const v = await (await p.$('#vs')).boundingBox();
		m = await glide(p, m, [v.x + v.width / 2, v.y + v.height * .3], 350);
		await p.mouse.down();
		m = await glide(p, m, [v.x + v.width / 2, v.y + v.height * .7], 700);
		await p.mouse.up();
		await p.waitForTimeout(700);
	} },
	// searchable dropdown (end page)
	dropdown: { w: 380, h: 330, url: 'windows/endpage/index.html', async run(p) {
		await p.waitForTimeout(900);
		await p.click('#mode button[data-m="extended"]');
		await p.waitForTimeout(600);
		const dd = (await p.$$('#form .dd'))[0];
		await dd.scrollIntoViewIfNeeded();
		await p.waitForTimeout(300);
		let m = await glide(p, [360, 300], await center(p, await dd.$('.dd-btn')), 450);
		await p.mouse.down(); await p.mouse.up();
		await p.waitForTimeout(700);
		for (const ch of 'hora') { await p.keyboard.type(ch); await p.waitForTimeout(160); }
		await p.waitForTimeout(500);
		await p.keyboard.press('ArrowDown'); await p.waitForTimeout(300);
		await p.keyboard.press('Enter'); await p.waitForTimeout(900);
	} },
	// fonts: families as groups, styles previewed, editable preview text
	fontes: { w: 380, h: 560, url: 'windows/fonts/index.html', async run(p) {
		// real font files of this machine in place of the network fonts (after the page's own first load)
		await p.waitForTimeout(700);
		await p.evaluate(() => {
			const F = [
				['Inter', '/usr/share/fonts/opentype/inter', ['Inter-Light.otf', 'Inter-Medium.otf', 'Inter-BoldItalic.otf', 'Inter-Black.otf']],
				['JetBrains Mono', '/usr/share/fonts/truetype/jetbrains-mono', ['JetBrainsMono-Light.ttf', 'JetBrainsMono-Bold.ttf']],
				['Carlito', '/usr/share/fonts/truetype/crosextra', ['Carlito-Regular.ttf', 'Carlito-Italic.ttf', 'Carlito-Bold.ttf']],
				['Caladea', '/usr/share/fonts/truetype/crosextra', ['Caladea-Regular.ttf', 'Caladea-BoldItalic.ttf']]
			];
			PGN.mock('fonts.list', () => ({ data: { canInstall: true, items: F.map((f) => ({ path: f[1], name: f[0], family: f[0], folder: '', files: f[2] })) } }), 200);
			document.getElementById('rf').click();
		});
		await p.waitForTimeout(900);
		let m = await glide(p, [350, 520], await center(p, '.fam:nth-child(1) .fh .nm'), 450);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(800);
		// type right in a sample: all follow
		m = await glide(p, m, await center(p, '.fam.open .st:nth-child(2) .s'), 400);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(200);
		await p.keyboard.press('Control+A');
		for (const ch of 'Jornal das Dez') { await p.keyboard.type(ch); await p.waitForTimeout(70); }
		await p.keyboard.press('Enter'); await p.waitForTimeout(500);
		m = await glide(p, m, await center(p, '#sizes button[data-s="l"]'), 400);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(800);
		m = await glide(p, m, await center(p, '#sizes button[data-s="s"]'), 300);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(500);
		m = await glide(p, m, await center(p, '.fam:nth-child(3) .fh .nm'), 400);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(700);
		m = await glide(p, m, await center(p, '.fam:nth-child(3) .box'), 300);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(500);
		m = await glide(p, m, await center(p, '#clr'), 400);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(1100);
	} },
	// palette in the preferences: hex as text, + cor
	paleta: { w: 420, h: 520, url: 'windows/settings/index.html', async run(p) {
		await p.waitForTimeout(1300);
		await p.evaluate(() => { const b = document.getElementById('body'); b.scrollTop = b.querySelector('.paled').offsetTop - 50; });
		await p.waitForTimeout(400);
		let m = await glide(p, [380, 500], await center(p, '.paled .pgrp:nth-child(1) .padd'), 500);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(300);
		for (const ch of '#2996EF') { await p.keyboard.type(ch); await p.waitForTimeout(90); }
		await p.keyboard.press('Enter'); await p.waitForTimeout(300);
		for (const ch of '#5CE6A1') { await p.keyboard.type(ch); await p.waitForTimeout(90); }
		await p.waitForTimeout(700);
		m = await glide(p, m, await center(p, '.paled .pgrp:nth-child(2) .pc:nth-child(2) .phx'), 450);
		await p.mouse.down(); await p.mouse.up(); await p.keyboard.press('Control+A');
		for (const ch of '#3A3A42') { await p.keyboard.type(ch); await p.waitForTimeout(90); }
		await p.waitForTimeout(1100);
	} },
	// effects in the preferences: pick from the installed effects
	efeitos: { w: 420, h: 520, url: 'windows/settings/index.html', async run(p) {
		await p.waitForTimeout(1300);
		await p.evaluate(() => { const b = document.getElementById('body'); b.scrollTop = b.querySelector('.fxed').offsetTop - 50; });
		await p.waitForTimeout(400);
		let m = await glide(p, [380, 500], await center(p, '.fxed .pgrp:nth-child(2) .padd'), 500);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(500);
		for (const ch of 'radial') { await p.keyboard.type(ch); await p.waitForTimeout(110); }
		await p.waitForTimeout(500);
		await p.keyboard.press('Enter'); await p.waitForTimeout(600);
		m = await glide(p, m, await center(p, '.fxed .pgrp:nth-child(2) .fxr:last-of-type .ic'), 450);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(600);
		m = await glide(p, m, await center(p, '.fxed .lpick .grid button:nth-child(13)'), 400);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(1100);
	} },
	// shortcuts editor in the preferences
	atalhos: { w: 360, h: 470, url: 'windows/settings/index.html', async run(p) {
		await p.waitForTimeout(1100);
		await (await p.$('.lked')).scrollIntoViewIfNeeded();
		await p.evaluate(() => { const b = document.getElementById('body'); b.scrollTop = b.querySelector('.lked').offsetTop - 30; });
		await p.waitForTimeout(400);
		let m = [330, 440];
		m = await glide(p, m, await center(p, '.lk[data-list="dirs"][data-i="1"] .ic'), 450);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(600);
		m = await glide(p, m, await center(p, '.lpick .grid button:nth-child(10)'), 400);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(500);
		m = await glide(p, m, await center(p, '.lpick .tabs button:nth-child(2)'), 300);
		await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(300);
		await p.keyboard.press('Control+A');
		for (const ch of 'MG') { await p.keyboard.type(ch); await p.waitForTimeout(180); }
		await p.waitForTimeout(500);
		// drag Planner to the top
		const h = await center(p, '.lk[data-list="sites"][data-i="3"] .oh');
		const top = await center(p, '.lk[data-list="sites"][data-i="0"]');
		m = await glide(p, m, h, 450);
		await p.mouse.down();
		m = await glide(p, m, [h[0], top[1] - 8], 700);
		await p.mouse.up();
		await p.waitForTimeout(1000);
	} }
};

(async () => {
	fs.mkdirSync(OUT, { recursive: true });
	const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENES);
	const b = await chromium.launch();
	for (const name of names) {
		const s = SCENES[name];
		const ctx = await b.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1, recordVideo: { dir: TMP, size: { width: s.w, height: s.h } } });
		await ctx.addInitScript(CURSOR);
		await ctx.addInitScript(() => { try { localStorage.clear(); } catch (e) { } });
		const p = await ctx.newPage();
		const errs = [];
		p.on('pageerror', (e) => errs.push(e.message));
		await p.goto(URL(s.url));
		const t0 = Date.now();
		await s.run(p);
		const dur = (Date.now() - t0) / 1000;
		const video = await p.video().path();
		await ctx.close();
		// trim the page load, then palette-based gif (smaller, crisp)
		const gif = path.join(OUT, name + '.gif');
		const start = Math.max(0, (await probe(video)) - dur);
		// (the recorder captures CSS pixels: the gif keeps the real size)
		const vf = 'fps=24,split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle';
		execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(start), '-i', video, '-vf', vf, '-loop', '0', gif]);
		console.log(name.padEnd(9), (fs.statSync(gif).size / 1024).toFixed(0) + ' KB', dur.toFixed(1) + 's', errs.length ? errs.join(' | ') : '');
	}
	await b.close();
	fs.rmSync(TMP, { recursive: true, force: true });
})();

function probe(file) {
	const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim();
	return parseFloat(out) || 0;
}
