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
PGN.n = function (count, one, many) {
	return count + ' ' + (count == 1 ? one : (many || one + 's'));
};

PGN.run = function (id, jsonArgs) {
	var out;
	var undoOpen = false;

	try {
		var fn = PGN.tools[id];

		if (typeof fn != 'function') PGN.fail('ferramenta desconhecida: ' + id);
		var args = jsonArgs ? JSON.parse(jsonArgs) : {};
		var r = fn(args || {});

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
