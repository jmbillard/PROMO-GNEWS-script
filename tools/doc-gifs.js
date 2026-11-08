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
			m = await glide(p, m, await center(p, await sec(p, name)), 450);
			await p.mouse.down(); await p.mouse.up();
			await p.waitForTimeout(1000);
		}
		// a long task: progress on the tile, footer line and selection chip
		const org = (await p.$$('#sections .sec.open .t'))[2];
		m = await glide(p, m, await center(p, org), 400);
		await p.mouse.down(); await p.mouse.up();
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
