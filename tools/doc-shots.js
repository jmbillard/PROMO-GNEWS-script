#!/usr/bin/env node
/*
---------------------------------------------------------------
> PROMO GNEWS · documentation screenshots
---------------------------------------------------------------
  opens the panel and every window in the browser (host calls
  simulated by PGN.mock), puts each one in a representative state
  and saves images/cep/<name>.png (2x).

  usage:  node tools/doc-shots.js [name ...]     (needs playwright)
*/
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'images/cep');
const URL = (p) => 'file://' + path.join(ROOT, 'cep/client', p);

async function openSection(p, name) {
	for (const s of await p.$$('#sections .sec .k')) {
		if ((await s.getAttribute('aria-label')) === name) { await s.click(); break; }
	}
	await p.waitForTimeout(900);
}
async function rest(p) { await p.mouse.move(1, 1); await p.waitForTimeout(250); }

const SHOTS = {
	// bar: compact vertical, wide vertical, horizontal (2 rows)
	panel: { w: 134, h: 640, url: 'panel/index.html', wait: 2900, async run(p) { await openSection(p, 'Animação'); } },
	'panel-wide': { w: 240, h: 900, url: 'panel/index.html', wait: 2900, async run(p) { await openSection(p, 'Projeto'); } },
	'panel-horizontal': { w: 980, h: 110, url: 'panel/index.html', wait: 2900, async run(p) { await openSection(p, 'Animação'); } },
	'panel-marca': { w: 240, h: 1240, url: 'panel/index.html', wait: 2900, async run(p) { await openSection(p, 'Marca'); } },
	curves: { w: 320, h: 420, url: 'windows/curves/index.html' },
	search: { w: 320, h: 460, url: 'windows/search/index.html', async run(p) {
		await p.fill('#q', 'ao vivo'); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
	} },
	templates: { w: 380, h: 600, url: 'windows/templates/index.html' },
	fonts: { w: 380, h: 640, url: 'windows/fonts/index.html', async run(p) {
		// real font files of this machine in place of the network fonts
		await p.evaluate(() => {
			const F = [
				['Inter', '/usr/share/fonts/opentype/inter', ['Inter-Light.otf', 'Inter-Medium.otf', 'Inter-BoldItalic.otf', 'Inter-Black.otf']],
				['JetBrains Mono', '/usr/share/fonts/truetype/jetbrains-mono', ['JetBrainsMono-Light.ttf', 'JetBrainsMono-Bold.ttf']],
				['Carlito', '/usr/share/fonts/truetype/crosextra', ['Carlito-Regular.ttf', 'Carlito-Italic.ttf', 'Carlito-Bold.ttf']],
				['Caladea', '/usr/share/fonts/truetype/crosextra', ['Caladea-Regular.ttf', 'Caladea-BoldItalic.ttf']]
			];
			PGN.mock('fonts.list', () => ({ data: { canInstall: true, items: F.map((f) => ({ path: f[1], name: f[0], family: f[0], folder: '', files: f[2] })) } }), 100);
			document.getElementById('rf').click();
		});
		await p.waitForTimeout(800);
		await p.click('.fam:nth-child(1) .fh .nm');
		await p.waitForTimeout(900);
	} },
	settings: { w: 420, h: 860, url: 'windows/settings/index.html', wait: 1300, async run(p) {
		// end right after the 'rede' group (no section cut in half)
		const h = await p.evaluate(() => {
			const g = [...document.querySelectorAll('.grp')].find((x) => /rede/i.test(x.querySelector('.glbl').textContent));
			const foot = document.querySelector('.status').getBoundingClientRect().height;
			return Math.ceil(g.getBoundingClientRect().bottom + 14 + foot);
		});
		await p.setViewportSize({ width: 420, height: h });
		await p.waitForTimeout(300);
	} },
	tags: { w: 320, h: 520, url: 'windows/tags/index.html' },
	endpage: { w: 380, h: 640, url: 'windows/endpage/index.html' },
	labels: { w: 360, h: 470, url: 'windows/labels/index.html' },
	'labels-editor': { w: 360, h: 470, url: 'windows/labels/index.html', async run(p) {
		await p.click('#grid .sw:nth-child(6)'); await p.waitForTimeout(500);
	} }
};

(async () => {
	const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SHOTS);
	const b = await chromium.launch();
	const errs = [];
	for (const name of names) {
		const s = SHOTS[name];
		const ctx = await b.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2 });
		await ctx.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('pgn.reduced', 'true'); } catch (e) { } });
		const p = await ctx.newPage();
		p.on('pageerror', (e) => errs.push(name + ': ' + e.message));
		await p.goto(URL(s.url));
		await p.waitForTimeout(s.wait || 1000);
		if (s.run) await s.run(p);
		await rest(p);
		await p.screenshot({ path: path.join(OUT, name + '.png') });
		await ctx.close();
		console.log('·', name);
	}
	await b.close();
	console.log(errs.length ? errs.join('\n') : 'no errors');
})();
