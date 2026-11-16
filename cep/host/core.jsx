/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP host core
---------------------------------------------------------------

  every action the HTML side can trigger is a registered tool:

    PGN.register('null', function (args) {
      var comp = PGN.comp();                 // throws if no comp
      ...
      return 'Null criado';                  // short pt-BR message
    });

  return values:
    · string                → { ok: true, msg }
    · { msg, data }         → { ok: true, msg, data }
    · nothing               → { ok: true, msg: '' }
  failures:
    · PGN.fail('mensagem')  → { ok: false, error }  (shown in the UI)
    · any other exception   → { ok: false, error: 'erro: ... (linha n)' }

  the client calls  PGN.run(id, jsonArgs)  and always gets JSON back.

*/

var PGN = PGN || {};

PGN.version = vStr;
PGN.tools = {};
PGN.ready = false;

PGN.register = function (id, fn) {
	PGN.tools[id] = fn;
};

PGN.fail = function (msg) {
	throw { pgn: true, message: msg };
};

// active comp or failure...
PGN.comp = function () {
	var aItem = app.project.activeItem;

	if (!(aItem instanceof CompItem)) PGN.fail('nenhuma comp ativa');
	return aItem;
};

// selected layers (requires at least 'min' layers)...
PGN.layers = function (min) {
	var comp = PGN.comp();
	var sel = comp.selectedLayers;

	if (min && sel.length < min) {
		PGN.fail(min > 1 ? 'selecione ' + min + ' layers ou mais' : 'nenhum layer selecionado');
	}
	return sel;
};

// plural helper → '1 layer' / '3 layers'
// writes a preferences JSON file (UTF-8); a file that can't be written (read-only or
// locked folder) is an error, never a silent 'saved'
PGN.writeJSON = function (f, data, pretty) {
	f.encoding = 'UTF-8';
	if (!f.open('w')) PGN.fail('n\u00E3o foi poss\u00EDvel gravar ' + f.fsName);
	var ok = f.write(pretty ? JSON.stringify(data, null, '\t') : JSON.stringify(data));

	f.close();
	if (!ok) PGN.fail('n\u00E3o foi poss\u00EDvel gravar ' + f.fsName);
};

PGN.n = function (count, one, many) {
	return count + ' ' + (count == 1 ? one : (many || one + 's'));
};

PGN.run = function (id, jsonArgs) {
	var out;
	var undoOpen = false;

	try {
		var fn = PGN.tools[id];

		if (typeof fn != 'function') PGN.fail('ferramenta desconhecida: ' + id);
		var args = jsonArgs ? JSON.parse(jsonArgs) || {} : {};

		// network shares needed by this tool (mounts them on macOS)...
		if (PGN.net && PGN.net.before) PGN.net.before(id, args);
		var r = fn(args);

		if (r == null) r = '';
		out = typeof r == 'string' ? { ok: true, msg: r } : { ok: true, msg: r.msg || '', data: r.data };

	} catch (err) {
		undoOpen = true;
		var msg = err && err.pgn ? err.message : 'erro: ' + (err && err.message ? err.message : String(err)) + (err && err.line ? ' (linha ' + err.line + ')' : '');
		out = { ok: false, error: msg };
	}
	// classic handlers open undo groups and may bail out early...
	if (undoOpen) {
		try { app.endUndoGroup(); } catch (e) { }
	}
	// echo on the AE 'info' panel...
	try {
		clearOutput();
		write(out.ok ? out.msg : out.error);
	} catch (e) { }

	return JSON.stringify(out);
};

/*

  long operations (organize, collect, batch...) run as JOBS:
  the panel calls begin once and step repeatedly, animating its
  progress bar between the calls (a busy AE freezes the panel).

    PGN.registerJob('org', {
      begin:  function (args)  { return { total: n, done: 0, label: '...' }; },
      step:   function (state) { ...one short slice (~0.2–0.5 s)...; state.done++; if (...) state.finished = true; },
      finish: function (state) { return 'Projeto organizado'; },   // optional, same contract as a tool
      cancel: function (state) { }                                   // optional cleanup
    });

  state: total (0 = indeterminate) · done · label (short pt-BR) · finished
  any other field is private to the job. PGN.fail works inside every callback.
  PGN.run(id) on a job runs every step in one go (fallback).

*/

PGN.jobs = {};
PGN._job = null;

PGN.registerJob = function (id, job) {
	PGN.jobs[id] = job;
	PGN.tools[id] = function (args) {
		var st = job.begin(args) || {};

		while (!st.finished) st = job.step(st) || st;
		return job.finish ? job.finish(st) : '';
	};
};

function PGN_jobOut(st, extra) {
	var o = { ok: true, done: st.done || 0, total: st.total || 0, label: st.label || '', finished: !!st.finished };

	if (extra) for (var k in extra) o[k] = extra[k];
	return JSON.stringify(o);
}

function PGN_jobFail(err) {
	try { app.endUndoGroup(); } catch (e) { }
	if (PGN._job) {
		try { if (PGN._job.job.cancel) PGN._job.job.cancel(PGN._job.state); } catch (e) { }
	}
	PGN._job = null;
	var msg = err && err.pgn ? err.message : 'erro: ' + (err && err.message ? err.message : String(err)) + (err && err.line ? ' (linha ' + err.line + ')' : '');
	try { clearOutput(); write(msg); } catch (e) { }
	return JSON.stringify({ ok: false, error: msg });
}

PGN.jobStart = function (id, jsonArgs) {
	try {
		var job = PGN.jobs[id];

		if (!job) PGN.fail('tarefa desconhecida: ' + id);
		if (PGN._job) {
			try { if (PGN._job.job.cancel) PGN._job.job.cancel(PGN._job.state); } catch (e) { }
		}
		var args = jsonArgs ? JSON.parse(jsonArgs) || {} : {};

		if (PGN.net && PGN.net.before) PGN.net.before(id, args);
		var st = job.begin(args) || {};

		st.done = st.done || 0;
		PGN._job = { id: id, job: job, state: st };
		return PGN_jobOut(st, { id: id });
	} catch (err) {
		return PGN_jobFail(err);
	}
};

PGN.jobStep = function () {
	try {
		var cur = PGN._job;

		if (!cur) PGN.fail('nenhuma tarefa em andamento');
		if (!cur.state.finished) cur.state = cur.job.step(cur.state) || cur.state;
		if (!cur.state.finished) return PGN_jobOut(cur.state);

		var r = cur.job.finish ? cur.job.finish(cur.state) : '';

		PGN._job = null;
		if (r == null) r = '';
		var msg = typeof r == 'string' ? r : (r.msg || '');
		// a long task leaves one undo step per slice: remember them all, so the panel
		// can offer to undo the whole task at once (job.undo)
		var u = cur.state.undo || [];

		PGN.lastJobUndo = u.length ? { id: cur.id, undo: u.slice(0) } : null;
		try { clearOutput(); write(msg); } catch (e) { }
		return PGN_jobOut(cur.state, { msg: msg, data: typeof r == 'string' ? undefined : r.data, undoable: u.length });
	} catch (err) {
		return PGN_jobFail(err);
	}
};

PGN.jobCancel = function () {
	var cur = PGN._job;

	PGN._job = null;
	if (cur && cur.job.cancel) {
		try { cur.job.cancel(cur.state); } catch (e) { }
	}
	try { app.endUndoGroup(); } catch (e) { }
	return JSON.stringify({ ok: true, msg: 'cancelado' });
};

// lightweight status polled by the panel (selection indicator)...
PGN.status = function () {
	var aItem = app.project.activeItem;
	var isComp = aItem instanceof CompItem;

	return JSON.stringify({
		comp: isComp ? aItem.name : null,
		layers: isComp ? aItem.selectedLayers.length : 0,
		project: app.project.file ? decodeURI(app.project.file.name) : null
	});
};

/*

  classic ScriptUI hooks used inside ported handlers:
  the panel no longer exists, so errors become failures
  and the 'blocking progress' screen becomes a no-op.

*/

showTabErr = function (msg) {
	PGN.fail(msg);
};

showTabProg = function (msg) { };
