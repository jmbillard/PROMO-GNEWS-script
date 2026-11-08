/* from El PALLETERO (github.com/jmbillard/EL-PALETTERO) — kept as is */
/* El PALLETERO · nomes automáticos de cor (pt-BR, evocativos)
   Escolhe o nome da referência mais próxima em CIELAB e evita repetir nomes na mesma paleta. */
(function (root) {
	'use strict';
	var C = root.PalColor;

	var LIST = [
		// vermelhos e rosas
		['vermelho', '#E53935'], ['tomate', '#FF6347'], ['cereja', '#9B111E'], ['carmim', '#960018'], ['sangue', '#6E0B0B'],
		['morango', '#FC5A8D'], ['melancia', '#FD4659'], ['framboesa', '#C72C48'], ['coral', '#FF7F50'], ['salmão', '#FA8072'],
		['goiaba', '#F1707B'], ['chiclete', '#FF8CCD'], ['rosa', '#FF9EC4'], ['algodão-doce', '#F8C8DC'], ['magenta', '#E4007C'],
		['pink', '#FF1493'], ['vinho', '#5E1224'], ['bordô', '#800020'], ['rubi', '#C41E3A'], ['rosa-antigo', '#C08081'],
		// terrosos e laranjas
		['ferrugem', '#B7410E'], ['tijolo', '#B5503C'], ['terracota', '#E2725B'], ['telha', '#C8553D'], ['argila', '#B66A50'],
		['laranja', '#FF8C1A'], ['tangerina', '#F28500'], ['abóbora', '#FF7518'], ['pêssego', '#FFCBA4'], ['damasco', '#FBCEB1'],
		['mamão', '#FFA66B'], ['caramelo', '#C68E17'], ['canela', '#9C5A3C'], ['chocolate', '#5C3317'], ['café', '#4B2E20'],
		['cacau', '#6B4226'], ['castanha', '#8B5A2B'], ['areia', '#D8C39A'], ['bege', '#E8D9B5'], ['camelo', '#C19A6B'],
		['cobre', '#B87333'], ['bronze', '#CD7F32'], ['cáqui', '#C3B091'], ['taupe', '#8B7D6B'],
		// amarelos
		['âmbar', '#FFBF00'], ['mel', '#E8A33D'], ['ocre', '#CC7722'], ['mostarda', '#E1AD01'], ['açafrão', '#F4C430'],
		['amarelo', '#FFE01B'], ['limão-siciliano', '#FFF44F'], ['gema', '#FFC72C'], ['banana', '#FFE135'], ['manteiga', '#FFF1A8'],
		['palha', '#E4D96F'], ['baunilha', '#F3E5AB'], ['creme', '#FFFDD0'], ['champanhe', '#F7E7CE'], ['ouro', '#D4AF37'],
		// verdes
		['lima', '#BFFF00'], ['limão', '#9ACD32'], ['pistache', '#93C572'], ['menta', '#5DE6A2'], ['hortelã', '#98FF98'],
		['sálvia', '#9CAF88'], ['oliva', '#708238'], ['musgo', '#4A5D23'], ['folha', '#3A7D2C'], ['bandeira', '#009C3B'],
		['esmeralda', '#50C878'], ['jade', '#00A86B'], ['garrafa', '#006A4E'], ['floresta', '#1F4D2B'], ['abacate', '#568203'],
		['chá-verde', '#C5E1A5'], ['eucalipto', '#5F8575'], ['pinho', '#01796F'], ['aspargo', '#87A96B'],
		// cianos
		['turquesa', '#40E0D0'], ['piscina', '#3BC4E2'], ['água-marinha', '#7FFFD4'], ['petróleo', '#005F6A'], ['ciano', '#00B7EB'],
		['caribe', '#00B2A9'], ['lagoa', '#2A9D8F'], ['gelo', '#DDF3F5'],
		// azuis
		['céu', '#80C0FE'], ['celeste', '#87CEEB'], ['azul', '#1E6FFF'], ['cobalto', '#0047AB'], ['royal', '#4169E1'],
		['marinho', '#0B1F4B'], ['jeans', '#4F6D99'], ['denim', '#1560BD'], ['oceano', '#1B4F72'], ['safira', '#0F52BA'],
		['noite', '#1E2A44'], ['meia-noite', '#121A33'], ['aço', '#4682B4'], ['ardósia', '#6A7B8C'], ['nuvem', '#DCE6F0'],
		['azul-bebê', '#A7C7E7'], ['índigo', '#3F3FA8'],
		// roxos
		['lavanda', '#B5ADFF'], ['lilás', '#C8A2C8'], ['violeta', '#7F00FF'], ['roxo', '#6A0DAD'], ['uva', '#6F2DA8'],
		['ameixa', '#673147'], ['berinjela', '#3D0C45'], ['orquídea', '#DA70D6'], ['malva', '#E0B0FF'], ['púrpura', '#800080'],
		['açaí', '#4A1942'], ['ametista', '#9966CC'], ['glicínia', '#C9A0DC'], ['fúcsia', '#FF00FF'],
		// neutros
		['branco', '#FFFFFF'], ['papel', '#F5F3EE'], ['marfim', '#FFFFF0'], ['osso', '#E3DAC9'], ['névoa', '#D9DCE1'],
		['prata', '#C0C0C0'], ['concreto', '#A6A6A6'], ['cimento', '#8D8D8D'], ['cinza', '#808080'], ['fumaça', '#6E6E6E'],
		['chumbo', '#4A4A4A'], ['grafite', '#383838'], ['carvão', '#2B2B2B'], ['asfalto', '#1F1F1F'], ['nanquim', '#111111'],
		['preto', '#000000']
	].map(function (e) { return { name: e[0], lab: C.rgbToLab(C.hexToRgb(e[1])) }; });

	var cache = {};
	function ranked(hex) {
		hex = C.normHex(hex) || '#000000';
		if (cache[hex]) return cache[hex];
		var lab = C.rgbToLab(C.hexToRgb(hex));
		var list = LIST.map(function (e) {
			// peso menor na luminosidade: o matiz importa mais para o nome
			var d = Math.pow((lab[0] - e.lab[0]) * 0.7, 2) + Math.pow(lab[1] - e.lab[1], 2) + Math.pow(lab[2] - e.lab[2], 2);
			return { name: e.name, lab: e.lab, d: d };
		}).sort(function (a, b) { return a.d - b.d; });
		return (cache[hex] = { lab: lab, list: list });
	}

	function nearest(hex) { return ranked(hex).list[0].name; }

	function unique(base, taken) {
		if (taken.indexOf(base) < 0) return base;
		for (var n = 2; ; n++) if (taken.indexOf(base + ' ' + n) < 0) return base + ' ' + n;
	}

	// nome livre dentro da paleta: o mais próximo; se já existe, um vizinho parecido;
	// depois "suave"/"forte" conforme a luminosidade; por último, um número
	function pick(hex, taken) {
		var r = ranked(hex), best = r.list[0];
		if (taken.indexOf(best.name) < 0) return best.name;
		for (var i = 1; i < 4; i++) {
			var alt = r.list[i];
			if (alt.d <= Math.max(best.d * 2.5, 220) && taken.indexOf(alt.name) < 0) return alt.name;
		}
		var mod = best.name + (r.lab[0] >= best.lab[0] ? ' suave' : ' forte');
		if (taken.indexOf(mod) < 0) return mod;
		return unique(best.name, taken);
	}

	// rótulos do script antigo ("cor 3", vazio ou o próprio hex) contam como automáticos
	function isGeneric(label, hex) {
		var l = String(label || '').trim();
		return !l || /^cor \d+$/i.test(l) || l.toUpperCase() === String(hex).toUpperCase();
	}

	root.PalNames = { nearest: nearest, pick: pick, unique: unique, isGeneric: isGeneric };
})(window);
