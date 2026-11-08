#!/usr/bin/env node
/*
---------------------------------------------------------------
> PROMO GNEWS · documentation icons
---------------------------------------------------------------
  renders every button of the bar (cep/client/panel/tools.js +
  shared/link-icons.js) as a PNG for the README, larger than in the
  bar and with the accent stroke in the section color, so similar
  icons are easy to tell apart:

    images/doc/icons/<section>.png          section chip (solid, like the open section)
    images/doc/icons/<section>-<tool>.png   tool tile
    images/doc/icons/foot-<n>.png           footer buttons
    images/doc/icons/link-<key>.png         icons offered for 'Atalhos'
    images/doc/icons/fxi-<key>.png          icons offered for 'Efeitos'
    images/doc/icons/cor-<hex>.png          default palette swatches (host/tools/palette.jsx)

  usage:  node tools/doc-icons.js        (needs playwright)
*/
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'images/doc/icons');
const CLIENT = 'file://' + path.join(ROOT, 'cep/client');

// default palette, read from the host (one source of truth)
const PALETTE = JSON.stringify((fs.readFileSync(path.join(ROOT, 'cep/host/tools/palette.jsx'), 'utf8').match(/#[0-9A-F]{6}/g) || []).filter((v, i, a) => a.indexOf(v) === i));

const PAGE = `<!doctype html><meta charset="utf-8">
<style>
	body { margin: 0; background: transparent; font-family: Inter, 'Segoe UI', system-ui, sans-serif; }
	.tile { width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; background: #1E1E22; margin: 4px; color: #E6E6EA; }
	.tile svg { width: 22px; height: 22px; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
	.tile .b { stroke: #E6E6EA; } .tile .a { stroke: var(--acc); }
	.tile .g { font: 700 13px/1 'JetBrains Mono', Consolas, monospace; color: #E6E6EA; }
	.tile .sw { width: 22px; height: 22px; border-radius: 3px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
	.chip { background: var(--acc); }
	.chip .b, .chip .a { stroke: #141416; }
</style>
<div id="out"></div>
<script>window.UI = { store: function () {} };</script>
<script src="${CLIENT}/shared/link-icons.js"></script>
<script src="${CLIENT}/shared/fx-icons.js"></script>
<script src="${CLIENT}/panel/tools.js"></script>
<script>window.PALETTE_DEFAULT = ${PALETTE};</script>
<script>
	var out = document.getElementById('out');
	function svg(d, a) {
		return '<svg viewBox="0 0 24 24">' + (d ? '<path class="b" d="' + d + '"/>' : '') + (a ? '<path class="a" d="' + a + '"/>' : '') + '</svg>';
	}
	function tile(name, acc, inner, chip) {
		var el = document.createElement('div');
		el.className = 'tile' + (chip ? ' chip' : '');
		el.style.setProperty('--acc', acc);
		el.dataset.name = name;
		el.innerHTML = inner;
		out.appendChild(el);
	}
	SECTIONS.forEach(function (s) {
		tile(s.id, s.acc, svg(s.d, s.a), true);
		s.groups.forEach(function (g) {
			g.forEach(function (t) {
				var id = s.id + '-' + String(t.id).replace(/[^\\w.-]/g, '_').replace(/^color_/, 'cor-');
				if (t.swatch) tile(id, s.acc, '<i class="sw" style="background:' + t.hex + '"></i>');
				else if (t.glyph) tile(id, s.acc, '<span class="g">' + t.glyph + '</span>');
				else tile(id, s.acc, svg(t.d, t.a));
			});
		});
	});
	FOOTER.forEach(function (f, i) { tile('foot-' + i, '#ECFF8C', svg(f.d, f.a)); });
	Object.keys(LINK_ICONS).forEach(function (k) { tile('link-' + k, '#FFB398', svg(LINK_ICONS[k][0], LINK_ICONS[k][1])); });
	['OD', 'TR', 'AP', 'PL'].forEach(function (g) { tile('link-' + g.toLowerCase(), '#FFB398', '<span class="g">' + g + '</span>'); });
	Object.keys(FX_ICONS).forEach(function (k) { tile('fxi-' + k, '#ACCDEC', svg(FX_ICONS[k][0], FX_ICONS[k][1])); });
	PALETTE_DEFAULT.forEach(function (hex) { tile('cor-' + hex.slice(1), '#BBBBBD', '<i class="sw" style="background:' + hex + '"></i>'); });
</script>`;

(async () => {
	fs.mkdirSync(OUT, { recursive: true });
	const tmp = path.join(ROOT, 'tools', '.doc-icons.html');
	fs.writeFileSync(tmp, PAGE);
	const b = await chromium.launch();
	const p = await b.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 2 });
	const errs = [];
	p.on('pageerror', (e) => errs.push(e.message));
	await p.goto('file://' + tmp);
	await p.waitForTimeout(300);
	const tiles = await p.$$('.tile');
	for (const t of tiles) {
		const name = await t.getAttribute('data-name');
		await t.screenshot({ path: path.join(OUT, name + '.png'), omitBackground: true });
	}
	await b.close();
	fs.unlinkSync(tmp);
	console.log(tiles.length + ' icons → ' + path.relative(ROOT, OUT) + (errs.length ? '\n' + errs.join('\n') : ''));
})();
