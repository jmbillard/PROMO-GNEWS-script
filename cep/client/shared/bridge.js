/*
---------------------------------------------------------------
> PROMO GNEWS · CEP bridge
---------------------------------------------------------------
  tiny wrapper over window.__adobe_cep__ (no CSInterface.js needed):

    PGN.run(id, args)        → Promise<{ ok, msg, data, error }>
    PGN.eval(script)         → Promise<string>
    PGN.open(window)         → opens a modeless window ('curves', 'search'...)
    PGN.emit(type, data)     / PGN.on(type, fn)   → events between extensions
    PGN.notify(msg, ok, acc) → toast on the panel (from any window)
    PGN.close()              → closes the current window

  outside After Effects (plain browser) every call is simulated, so the
  pages can be previewed and styled without the host. Pages may register
  fake data with PGN.mock(id, fn).
*/
(function () {
	'use strict';

	var cep = window.__adobe_cep__;
	var inHost = !!cep;
	var BUNDLE = 'com.promognews.cep';
	var EV = 'com.promognews.';
	var mocks = {};

	function extensionPath() {
		if (!inHost) return '';
		var p = decodeURI(cep.getSystemPath('extension'));
		return /^win/i.test(navigator.platform) ? p.replace(/^file:\/\/\//, '') : p.replace(/^file:\/\//, '');
	}

	function jsStr(s) {
		return JSON.stringify(String(s)).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
	}

	function evalScript(script) {
		return new Promise(function (resolve) {
			if (!inHost) { resolve(''); return; }
			cep.evalScript(script, function (res) { resolve(res); });
		});
	}

	var hostReady = null;

	// the panel loads the host through the manifest; windows make sure it is there...
	function ensureHost() {
		if (!inHost) return Promise.resolve(true);
		if (hostReady) return hostReady;
		var file = extensionPath() + '/host/index.jsx';
		var script = '(function(){ if (typeof PGN != "undefined" && PGN.ready) return "ok";' +
			' $.evalFile(new File(' + jsStr(file) + ')); return (typeof PGN != "undefined" && PGN.ready) ? "ok" : "fail"; })()';
		hostReady = evalScript(script).then(function (r) {
			if (r !== 'ok') hostReady = null;
			return r === 'ok';
		});
		return hostReady;
	}

	function delay(ms) {
		return new Promise(function (r) { setTimeout(r, ms); });
	}

	function run(id, args) {
		if (!inHost) {
			var m = mocks[id];
			return delay(m && m.ms != null ? m.ms : 450).then(function () {
				try {
					var r = m ? m.fn(args || {}) : { ok: true, msg: 'simulado · ' + id };
					return r && r.ok != null ? r : { ok: true, msg: (r && r.msg) || '', data: r && r.data };
				} catch (e) {
					return { ok: false, error: e.message };
				}
			});
		}
		return ensureHost().then(function () {
			return evalScript('PGN.run(' + jsStr(id) + ',' + jsStr(JSON.stringify(args || {})) + ')');
		}).then(function (res) {
			try {
				return JSON.parse(res);
			} catch (e) {
				return { ok: false, error: res && res !== 'EvalScript error.' ? String(res) : 'falha na comunicação com o After Effects' };
			}
		});
	}

	function status() {
		if (!inHost) {
			var m = mocks.status;
			return Promise.resolve(m ? m.fn() : { comp: 'comp 1', layers: 3 });
		}
		return evalScript('(typeof PGN != "undefined" && PGN.ready) ? PGN.status() : ""').then(function (r) {
			try { return JSON.parse(r); } catch (e) { return null; }
		});
	}

	function emit(type, data) {
		if (!inHost) {
			window.dispatchEvent(new CustomEvent(EV + type, { detail: data }));
			try { localStorage.setItem('pgn-ev', JSON.stringify({ type: type, data: data, t: Date.now() })); } catch (e) { }
			return;
		}
		cep.dispatchEvent({
			type: EV + type,
			scope: 'APPLICATION',
			appId: '',
			extensionId: '',
			data: JSON.stringify(data == null ? null : data)
		});
	}

	function on(type, fn) {
		if (!inHost) {
			window.addEventListener(EV + type, function (e) { fn(e.detail); });
			window.addEventListener('storage', function (e) {
				if (e.key !== 'pgn-ev' || !e.newValue) return;
				try { var ev = JSON.parse(e.newValue); if (ev.type === type) fn(ev.data); } catch (err) { }
			});
			return;
		}
		cep.addEventListener(EV + type, function (ev) {
			var d = ev && ev.data;
			if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { } }
			fn(d);
		});
	}

	function open(name) {
		if (!inHost) {
			window.open('../windows/' + name + '/index.html', 'pgn-' + name, 'width=360,height=520');
			return;
		}
		cep.requestOpenExtension(BUNDLE + '.' + name, '');
	}

	function close() {
		if (inHost) cep.closeExtension(); else window.close();
	}

	function openURL(url) {
		if (inHost && window.cep && window.cep.util) window.cep.util.openURLInDefaultBrowser(url);
		else window.open(url, '_blank');
	}

	window.PGN = {
		inHost: inHost,
		run: run,
		eval: evalScript,
		status: status,
		emit: emit,
		on: on,
		open: open,
		close: close,
		openURL: openURL,
		ensureHost: ensureHost,
		notify: function (msg, ok, acc) { emit('toast', { msg: msg, ok: ok !== false, acc: acc || null }); },
		mock: function (id, fn, ms) { mocks[id] = { fn: fn, ms: ms }; }
	};
})();
