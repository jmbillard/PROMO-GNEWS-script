/*
---------------------------------------------------------------
> PROMO GNEWS · GNEWS logo (static + opening animation)
---------------------------------------------------------------
  the data comes from the script's own shape-layer builders
  (tools/gnews-logo.js → logo-data.js). This draws it the way the
  shape layer does: groups with transforms, paths and rects, merge
  paths (merge = even-odd, subtract, intersect) and one fill. Every
  key in the original is 'hold', so a property is simply the last key
  at or before t.

    PGN_LOGO_DRAW(ctx, t, color, view)   one frame
    PGN_LOGO_SVG(part)                   <svg> of the static 'globo' or full logo
*/
(function () {
	'use strict';

	var L = window.PGN_LOGO;
	if (!L) return;

	function val(p, t) {
		if (!p || !p.k) return p;
		var v = p.k[0][1];
		for (var i = 0; i < p.k.length && p.k[i][0] <= t + 1e-6; i++) v = p.k[i][1];
		return v;
	}

	function shapePath(s, m) {
		var raw = new Path2D(), v = s.v, o = s.o, ii = s.i, n = v.length;
		raw.moveTo(v[0][0], v[0][1]);
		for (var k = 1; k <= (s.c ? n : n - 1); k++) {
			var a = v[k - 1], b = v[k % n];
			raw.bezierCurveTo(a[0] + o[k - 1][0], a[1] + o[k - 1][1], b[0] + ii[k % n][0], b[1] + ii[k % n][1], b[0], b[1]);
		}
		if (s.c) raw.closePath();
		var p = new Path2D();
		p.addPath(raw, m);
		return p;
	}

	function rectPath(z, pos, m) {
		var raw = new Path2D();
		if (z[0] > 0 && z[1] > 0) raw.rect(pos[0] - z[0] / 2, pos[1] - z[1] / 2, z[0], z[1]);
		var p = new Path2D();
		p.addPath(raw, m);
		return p;
	}

	function groupMatrix(g, t) {
		var p = val(g.p, t), a = val(g.a, t), s = val(g.s, t), r = val(g.r, t) || 0;
		return new DOMMatrix().translate(p[0], p[1]).rotate(r).scale(s[0] / 100, s[1] / 100).translate(-a[0], -a[1]);
	}

	// items: { p: Path2D } (even-odd) or { c: canvas mask already in the fill color }
	function run(list, m, t, env) {
		var items = [];
		list.forEach(function (n) {
			if (n.t === 'G') {
				var gm = groupMatrix(n, t);
				if (gm.a === 0 && gm.d === 0) return;   // scaled to nothing
				items = items.concat(run(n.kids, m.multiply(gm), t, env));
			} else if (n.t === 'P') items.push({ p: shapePath(val(n.s, t), m) });
			else if (n.t === 'R') items.push({ p: rectPath(val(n.z, t), val(n.p, t), m) });
			else if (n.t === 'M') items = merge(items, val(n.m, t), env);
		});
		return items;
	}

	function layer(env) {
		var c = document.createElement('canvas');
		c.width = env.w; c.height = env.h;
		var x = c.getContext('2d');
		x.fillStyle = env.color;
		return { c: c, x: x };
	}
	function paint(x, it) {
		if (it.p) x.fill(it.p, 'evenodd');
		else x.drawImage(it.c, 0, 0);
	}

	function merge(items, mode, env) {
		if (!items.length) return items;
		if (mode === 1 && items.every(function (it) { return it.p; })) {
			var all = new Path2D();
			items.forEach(function (it) { all.addPath(it.p); });
			return [{ p: all }];
		}
		var L2 = layer(env);
		paint(L2.x, items[0]);
		var op = { 1: 'xor', 2: 'source-over', 3: 'destination-out', 4: 'destination-in', 5: 'xor' }[mode] || 'source-over';
		L2.x.globalCompositeOperation = op;
		if (mode === 4 && items.length > 1) {
			// intersect: what is common to all the others → draw their union with destination-in
			var rest = layer(env);
			items.slice(1).forEach(function (it) { paint(rest.x, it); });
			L2.x.drawImage(rest.c, 0, 0);
		} else items.slice(1).forEach(function (it) { paint(L2.x, it); });
		return [{ c: L2.c }];
	}

	// view: { cx, cy, scale } in logo units → canvas pixels
	window.PGN_LOGO_DRAW = function (ctx, t, color, view) {
		var w = ctx.canvas.width, h = ctx.canvas.height;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, w, h);
		var m = new DOMMatrix().translate(w / 2, h / 2).scale(view.scale).translate(-view.cx, -view.cy);
		var env = { w: w, h: h, color: color };
		var items = run(L.anim, m, t, env);
		ctx.fillStyle = color;
		items.forEach(function (it) { paint(ctx, it); });
	};
	window.PGN_LOGO_END = 1.57;

	window.PGN_LOGO_SVG = function (part) {
		var b = part === 'globo' ? L.gbox : L.box;
		var NS = 'http://www.w3.org/2000/svg';
		var svg = document.createElementNS(NS, 'svg');
		// a small margin: antialiased edges are not clipped
		var m = Math.round(b[3] * 0.04);
		svg.setAttribute('viewBox', [b[0] - m, b[1] - m, b[2] + 2 * m, b[3] + 2 * m].join(' '));
		svg.setAttribute('aria-hidden', 'true');
		svg.setAttribute('class', 'gl gl-' + part);
		var g = document.createElementNS(NS, 'path');
		g.setAttribute('d', L.globo);
		g.setAttribute('fill-rule', 'evenodd');
		g.setAttribute('class', 'globo');
		svg.appendChild(g);
		if (part !== 'globo') {
			var n = document.createElementNS(NS, 'path');
			n.setAttribute('d', L.news);
			n.setAttribute('fill-rule', 'evenodd');
			n.setAttribute('class', 'news');
			svg.appendChild(n);
		}
		return svg;
	};
})();
