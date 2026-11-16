/*
---------------------------------------------------------------
> PROMO GNEWS · GNEWS logo for the CEP panel
---------------------------------------------------------------
  runs the script's own shape-layer builders
    source/libraries/shape templates/logo animation 3s.jsxinc
    source/libraries/shape templates/logo static.jsxinc
  against a tiny After Effects mock, and writes what they build as
  data for the panel (cep/client/panel/logo-data.js):

    PGN_LOGO.anim    the opening animation (groups, paths, rects, merges,
                     keyframes; every key is 'hold' in the original)
    PGN_LOGO.globo   static globe, SVG path data (even-odd)
    PGN_LOGO.news    static 'news' lettering, SVG path data
    PGN_LOGO.box     static logo bounds [x, y, w, h]

  usage:  node tools/gnews-logo.js
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'source/libraries/shape templates');
const OUT = path.join(ROOT, 'cep/client/panel/logo-data.js');

/* ---------- After Effects mock ---------- */

class Shape { dump() { return { v: this.vertices, i: this.inTangents, o: this.outTangents, c: this.closed }; } }
class KeyframeEase { constructor(s, i) { this.speed = s; this.influence = i; } }
class Prop {
	constructor(mn) { this.mn = mn; this.name = mn; this.kids = []; this.keys = []; }
	setValue(v) { this.value = v instanceof Shape ? v.dump() : v; }
	setValueAtTime(t, v) { this.keys.push([t, v instanceof Shape ? v.dump() : v]); }
	property(mn) {
		let p = this.kids.find((k) => k.mn === mn || k.name === mn);
		if (!p) { p = new Prop(mn); p.parentProperty = this; this.kids.push(p); }
		return p;
	}
	addProperty(mn) { const p = new Prop(mn); p.parentProperty = this; p.item = true; this.kids.push(p); return p; }
}
['setTemporalEaseAtKey', 'setInterpolationTypeAtKey', 'setSpatialContinuousAtKey', 'setSpatialTangentsAtKey',
	'setTemporalContinuousAtKey', 'setTemporalAutoBezierAtKey', 'setSpatialAutoBezierAtKey', 'setRovingAtKey'].forEach((m) => { Prop.prototype[m] = function () {}; });

function build(file, fn) {
	const layer = new Prop('layer');
	const ctx = { app: { project: { activeItem: { layers: { addShape: () => layer } } } }, Shape, KeyframeEase };
	new Function('app', 'Shape', 'KeyframeEase', fs.readFileSync(path.join(DIR, file), 'utf8') + '\n;' + fn + '();')(ctx.app, Shape, KeyframeEase);
	return layer.property('ADBE Root Vectors Group');
}

/* ---------- tree → compact data ---------- */

const r2 = (n) => Math.round(n * 100) / 100;
const num = (v) => (Array.isArray(v) ? v.map(num) : (typeof v === 'number' ? r2(v) : v));
function prop(p, def) {
	if (!p) return def;
	if (p.keys.length) return { k: p.keys.map((k) => [r2(k[0]), num(k[1])]) };   // hold keys
	return p.value !== undefined ? num(p.value) : def;
}
function shapeOf(s) { return { v: num(s.v), i: num(s.i), o: num(s.o), c: s.c }; }

// one 'contents' list (ADBE Vectors Group / Root Vectors Group) → items
function contents(list) {
	const out = [];
	list.kids.filter((k) => k.item).forEach((k) => {
		if (k.mn === 'ADBE Vector Group') {
			const tf = k.property('ADBE Vector Transform Group');
			out.push({
				t: 'G', n: k.name,
				p: prop(tf.kids.find((x) => x.mn === 'ADBE Vector Position'), [0, 0]),
				a: prop(tf.kids.find((x) => x.mn === 'ADBE Vector Anchor'), [0, 0]),
				s: prop(tf.kids.find((x) => x.mn === 'ADBE Vector Scale'), [100, 100]),
				r: prop(tf.kids.find((x) => x.mn === 'ADBE Vector Rotation'), 0),
				kids: contents(k.property('ADBE Vectors Group'))
			});
		} else if (k.mn === 'ADBE Vector Shape - Group') {
			const s = k.kids.find((x) => x.mn === 'ADBE Vector Shape');
			out.push({ t: 'P', s: s.keys.length ? { k: s.keys.map((kk) => [r2(kk[0]), shapeOf(kk[1])]) } : shapeOf(s.value) });
		} else if (k.mn === 'ADBE Vector Shape - Rect') {
			out.push({ t: 'R', z: prop(k.kids.find((x) => x.mn === 'ADBE Vector Rect Size'), [100, 100]), p: prop(k.kids.find((x) => x.mn === 'ADBE Vector Rect Position'), [0, 0]) });
		} else if (k.mn === 'ADBE Vector Filter - Merge') {
			out.push({ t: 'M', m: prop(k.kids.find((x) => x.mn === 'ADBE Vector Merge Type'), 1) });
		}
	});
	return out;
}

/* ---------- static logo → SVG path data ---------- */

function d(shape, m) {
	const P = (x, y) => [r2(m[0] * x + m[2] * y + m[4]), r2(m[1] * x + m[3] * y + m[5])];
	const v = shape.v, o = shape.o, i = shape.i, n = v.length;
	let s = 'M' + P(v[0][0], v[0][1]).join(' ');
	for (let k = 1; k <= (shape.c ? n : n - 1); k++) {
		const a = v[k - 1], b = v[k % n];
		s += 'C' + P(a[0] + o[k - 1][0], a[1] + o[k - 1][1]).join(' ') + ' ' + P(b[0] + i[k % n][0], b[1] + i[k % n][1]).join(' ') + ' ' + P(b[0], b[1]).join(' ');
	}
	return s + (shape.c ? 'Z' : '');
}
const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
function gm(g) {
	const p = g.p, a = g.a, s = g.s;
	return mul([1, 0, 0, 1, p[0], p[1]], mul([s[0] / 100, 0, 0, s[1] / 100, 0, 0], [1, 0, 0, 1, -a[0], -a[1]]));
}
function paths(items, m, pick, inside, acc) {
	items.forEach((it) => {
		if (it.t === 'G') paths(it.kids, mul(m, gm(it)), pick, inside || it.n === pick, acc);
		else if (it.t === 'P' && inside) acc.push(d(it.s, m));
	});
	return acc;
}

const anim = contents(build('logo animation 3s.jsxinc', 'shpMarcaGnewsAnimation3'));
const stat = contents(build('logo static.jsxinc', 'shpMarcaGnewsStatic'));
const I = [1, 0, 0, 1, 0, 0];
const globo = paths(stat, I, 'globo', false, []).join('');
const news = paths(stat, I, 'news', false, []).join('');

// bounds from the path coordinates (control points included: a little generous, fine for a viewBox)
const xs = [], ys = [];
(globo + news).replace(/-?\d+(\.\d+)?\s-?\d+(\.\d+)?/g, (pt) => { const q = pt.split(' '); xs.push(+q[0]); ys.push(+q[1]); });
const box = [Math.floor(Math.min(...xs)), Math.floor(Math.min(...ys)), Math.ceil(Math.max(...xs) - Math.min(...xs)), Math.ceil(Math.max(...ys) - Math.min(...ys))];
const gx = [], gy = [];
globo.replace(/-?\d+(\.\d+)?\s-?\d+(\.\d+)?/g, (pt) => { const q = pt.split(' '); gx.push(+q[0]); gy.push(+q[1]); });
const gbox = [Math.floor(Math.min(...gx)), Math.floor(Math.min(...gy)), Math.ceil(Math.max(...gx) - Math.min(...gx)), Math.ceil(Math.max(...gy) - Math.min(...gy))];

fs.writeFileSync(OUT,
	'/* generated by tools/gnews-logo.js from the script\'s own shape-layer builders — do not edit */\n' +
	'window.PGN_LOGO = ' + JSON.stringify({ anim, globo, news, box, gbox }) + ';\n');
console.log('wrote', path.relative(ROOT, OUT), fs.statSync(OUT).size + ' bytes', 'box', box, 'globe', gbox);
