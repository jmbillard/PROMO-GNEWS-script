/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · organization tags
---------------------------------------------------------------

  data backend for the HTML window that replaces the classic
  'org. tags' dialog ('source/layout/utils/tag ui.js' → tagDialog)
  with the tag list from 'tagsObj' ('source/globals.js').

    tags.list    → groups / tags / what each click does
    tags.apply   → { tag, group, alt }  one tag button
    tags.custom  → { text }             the custom tag field

  classic behavior (per group, left click):
    · compCommentTags        → comp items: comment = tag
    · multiTags, hardNewsTags → comp items: template name = tag
                                footage items: comment = tag
    · compTemplatePromoTags  → comp items: template name = tag
  right click (every group) → clears the comment of every
  selected project item (template names are kept).
  custom field → same as multiTags with the typed text.

*/

PGN.tags = {
	// pt-BR labels + text colors (GNEWS_secColors index) per group...
	groupInfo: {
		compCommentTags:       { label: 'comentário de comp', color: 10, kind: 'comentário nas comps' },
		multiTags:             { label: 'itens', color: 9, kind: 'template nas comps · comentário nos footages' },
		hardNewsTags:          { label: 'hard news', color: 1, kind: 'template nas comps · comentário nos footages' },
		compTemplatePromoTags: { label: 'template de comp', color: 8, kind: 'nome de template nas comps' }
	},

	altKind: 'limpa comentários dos itens',

	iconNames: ['ftgTogIcon', 'compTogIcon', 'solTogIcon', 'imgTogIcon', 'shpTogIcon', 'matteTogIcon', 'txtTogIcon', 'sonoTogIcon'],

	hex: function (rgbArr) {
		var s = '#';

		for (var i = 0; i < 3; i++) {
			var c = Math.round(Math.max(0, Math.min(1, rgbArr[i])) * 255).toString(16);

			s += c.length == 1 ? '0' + c : c;
		}
		return s.toUpperCase();
	},

	// icon object → short name ('ftgTogIcon' → 'ftg')...
	iconName: function (ico) {
		for (var i = 0; i < PGN.tags.iconNames.length; i++) {
			var n = PGN.tags.iconNames[i];

			if ($.global[n] === ico) return n.replace(/TogIcon$/, '');
		}
		return null;
	},

	selection: function () {
		var sel = app.project.selection;

		if (sel.length == 0) PGN.fail('nenhum item selecionado no projeto');
		return sel;
	},

	findGroup: function (tag, group) {
		if (group && tagsObj.hasOwnProperty(group)) return group;

		// no group given → first group holding the tag...
		for (var g in tagsObj) {
			if (!tagsObj.hasOwnProperty(g)) continue;
			for (var m = 0; m < tagsObj[g].length; m++) {
				if (tagsObj[g][m][0] == tag) return g;
			}
		}
		return null;
	},

	// right click: clears every selected item comment...
	clearComments: function () {
		var sel = PGN.tags.selection();

		app.beginUndoGroup('org. tags');
		for (var i = 0; i < sel.length; i++) {
			sel[i].comment = '';
		}
		app.endUndoGroup();

		return 'comentários removidos de ' + PGN.n(sel.length, 'item', 'itens');
	},

	// multiTags behavior: comps → template name | footage → comment...
	applyMulti: function (text) {
		var sel = PGN.tags.selection();
		var count = 0;

		app.beginUndoGroup('org. tags');
		for (var i = 0; i < sel.length; i++) {
			if (sel[i] instanceof CompItem) {
				sel[i].motionGraphicsTemplateName = text;
				count++;
			}
			if (sel[i] instanceof FootageItem) {
				sel[i].comment = text;
				count++;
			}
		}
		app.endUndoGroup();

		return count;
	}
};

//---------------------------------------------------------

PGN.register('tags.list', function (args) {
	var groups = [];

	for (var g in tagsObj) {
		if (!tagsObj.hasOwnProperty(g)) continue;

		var info = PGN.tags.groupInfo[g] || { label: g, color: 9, kind: '' };
		var tags = [];
		var color = null;

		try {
			color = PGN.tags.hex(GNEWS_secColors[info.color]);
		} catch (e) { }

		for (var m = 0; m < tagsObj[g].length; m++) {
			tags.push({
				name: tagsObj[g][m][0],
				icon: PGN.tags.iconName(tagsObj[g][m][1]),
				kind: info.kind,
				alt: PGN.tags.altKind
			});
		}
		groups.push({ id: g, label: info.label, color: color, tags: tags });
	}

	return {
		msg: '',
		data: {
			groups: groups,
			custom: { kind: PGN.tags.groupInfo.multiTags.kind, alt: null },
			hardNews: !!hardNews,
			items: app.project.numItems,
			selection: app.project.selection.length
		}
	};
});

//---------------------------------------------------------

PGN.register('tags.apply', function (args) {
	var tag = args.tag != null ? String(args.tag) : '';

	if (tag == '') PGN.fail('tag inválida');
	if (args.alt === true) return PGN.tags.clearComments();

	var group = PGN.tags.findGroup(tag, args.group);

	if (group == null) PGN.fail('tag desconhecida: ' + tag);

	var sel = PGN.tags.selection();
	var count = 0;

	if (group == 'compCommentTags' || group == 'compTemplatePromoTags') {
		app.beginUndoGroup('org. tags');
		for (var i = 0; i < sel.length; i++) {
			if (!(sel[i] instanceof CompItem)) continue;

			if (group == 'compCommentTags') {
				sel[i].comment = tag;
			} else {
				sel[i].motionGraphicsTemplateName = tag;
			}
			count++;
		}
		app.endUndoGroup();

		if (count == 0) PGN.fail('nenhuma comp selecionada');
		return 'tag ' + tag + ' aplicada em ' + PGN.n(count, 'comp');
	}
	// multiTags / hardNewsTags...
	count = PGN.tags.applyMulti(tag);

	if (count == 0) PGN.fail('nenhuma comp ou footage selecionado');
	return 'tag ' + tag + ' aplicada em ' + PGN.n(count, 'item', 'itens');
});

//---------------------------------------------------------

// tagCustomTxt.onEnterKey / tagCustomBtn.onClick...
PGN.register('tags.custom', function (args) {
	var text = args.text != null ? String(args.text) : '';
	var count = PGN.tags.applyMulti(text);

	if (count == 0) PGN.fail('nenhuma comp ou footage selecionado');
	if (text == '') return 'tag removida de ' + PGN.n(count, 'item', 'itens');

	return 'tag ' + text + ' aplicada em ' + PGN.n(count, 'item', 'itens');
});
