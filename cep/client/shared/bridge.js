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

	function jsStr(s) {
		return JSON.stringify(String(s)).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
	}

	function evalScript(script) {
		return new Promise(function (resolve) {
			if (!inHost) { resolve(''); return; }
			cep.evalScript(script, function (res) { resolve(res); });
		});
	}

	// pasta 'host' ao lado da pasta 'client' desta página (no uso normal a página abre direto da rede)
	function hostFolder() {
		var path = decodeURIComponent(location.pathname).replace(/\/client\/.*$/, '/host');
		if (location.host) return '//' + location.host + path;           // Windows: \\servidor\share
		if (/^\/[A-Za-z]:\//.test(path)) return path.slice(1);          // Windows: C:/...
		return path;
	}

	var hostReady = null;

	// carrega o host na primeira chamada da página, e de novo se algum arquivo dele mudou (host/loader.jsx)
	var hostFail = null;

	function ensureHost() {
		if (!inHost) return Promise.resolve(true);
		if (hostReady) return hostReady;
		// a host that failed to load is not retried for a while: the status poll runs every 1.2 s
		// and every retry re-evaluates the classic sources (and whatever they pop up)
		if (hostFail && Date.now() - hostFail.at < 20000) return Promise.reject(hostFail.err);
		var host = jsStr(hostFolder());
		hostReady = evalScript('try{$.evalFile(new File(' + host + '+"/loader.jsx"));PGN_hostState(' + host + ')}catch(e){"erro: "+e}')
			.then(function (state) {
				if (state === 'load') return evalScript('try{$.evalFile(new File(' + host + '+"/index.jsx"));PGN_hostLoaded()}catch(e){"erro: "+e+" (linha "+e.line+")"}');
				return state;
			})
			.then(function (state) {
				if (state !== 'ok' && state !== 'loaded') {
					hostReady = null; // tenta de novo mais tarde (a rede pode voltar)
					var err = new Error(String(state || 'o host do After Effects não carregou').replace(/^erro: /, ''));
					hostFail = { at: Date.now(), err: err };
					throw err;
				}
				hostFail = null;
				return true;
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
		}).then(parse, function (err) { return { ok: false, error: err.message }; });
	}

	function parse(res) {
		try {
			return JSON.parse(res);
		} catch (e) {
			return { ok: false, error: res && res !== 'EvalScript error.' ? String(res) : 'falha na comunicação com o After Effects' };
		}
	}

	/*
	  long tasks: begin + steps, so the page can animate between calls.
	  onProgress({ done, total, label }) after every step; resolves like run().
	  job.cancel() asks the host to stop after the current step.
	*/
	function job(id, args, onProgress) {
		var cancelled = false;
		var p;
		if (!inHost) {
			var m = mocks['job:' + id];
			var total = m ? m.total : 12, done = 0;
			p = new Promise(function (resolve) {
				(function tick() {
					if (cancelled) { resolve({ ok: false, error: 'cancelado', cancelled: true }); return; }
					if (onProgress) onProgress({ done: done, total: total, label: (m && m.label ? m.label : id) + ' ' + done + '/' + total });
					if (done >= total) { resolve({ ok: true, msg: m && m.msg ? m.msg : 'simulado · ' + id, undoable: 3 }); return; }
					done++;
					setTimeout(tick, 160);
				})();
			});
		} else {
			p = ensureHost().then(function () {
				return evalScript('PGN.jobStart(' + jsStr(id) + ',' + jsStr(JSON.stringify(args || {})) + ')').then(parse);
			}).then(function loop(r) {
				if (!r.ok) return r;
				if (onProgress) onProgress(r);
				if (r.finished && r.msg !== undefined) return r;
				if (cancelled) return evalScript('PGN.jobCancel()').then(function () { return { ok: false, error: 'cancelado', cancelled: true }; });
				// a frame for the page to paint before the host gets busy again
				return delay(16).then(function () { return evalScript('PGN.jobStep()'); }).then(parse).then(loop);
			}, function (err) { return { ok: false, error: err.message }; });
		}
		p.cancel = function () { cancelled = true; };
		return p;
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
		job: job,
		eval: evalScript,
		status: status,
		emit: emit,
		on: on,
		open: open,
		close: close,
		openURL: openURL,
		ensureHost: ensureHost,
		notify: function (msg, ok, acc) { emit('toast', { msg: msg, ok: ok !== false, acc: acc || null }); },
		// 'try again' buttons: forget a recent host failure so the next call reloads it now
		retryHost: function () { hostFail = null; hostReady = null; },
		mock: function (id, fn, ms) { mocks[id] = typeof fn === 'function' ? { fn: fn, ms: ms } : fn; },
		hostFolder: hostFolder
	};
})();
