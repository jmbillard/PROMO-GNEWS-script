/* eslint-disable no-undef */
/*

---------------------------------------------------------------
> PROMO GNEWS · carregador do host
---------------------------------------------------------------

  o código vive na rede: ao abrir, cada painel pede ao After Effects
  para ler este arquivo e conferir se o host (.jsx/.js da pasta host
  e os fontes clássicos em source/) mudou desde a última leitura.
  se mudou (ou nunca foi lido), o painel avalia index.jsx de novo.
  assim, para atualizar basta trocar os arquivos na rede e reabrir
  o painel. (mesma ideia do carregador do O PADEIRO)

*/

function PGN_hostSignature(folder) {
	var sig = '';
	var items = folder.getFiles();

	for (var i = 0; i < items.length; i++) {
		if (items[i] instanceof Folder) {
			sig += PGN_hostSignature(items[i]);
		} else if (/\.(jsx|js|jsxinc)$/i.test(items[i].name)) {
			sig += items[i].name + ':' + items[i].modified.getTime() + ';';
		}
	}
	return sig;
}

// fontes clássicos: host/src (pacote ou link de dev) ou <raiz>/source (rede / repositório)...
function PGN_sourceFolder(hostPath) {
	var a = new Folder(hostPath + '/src');
	var b = new Folder(hostPath + '/../../source');

	// <raiz>/source primeiro: uma cópia velha em host/src nunca vence os fontes atuais
	if (new File(b.fsName + '/globals.js').exists) return b;
	if (new File(a.fsName + '/globals.js').exists) return a;
	return null;
}

// 'ok' (host atual já carregado), 'load' (o painel deve avaliar index.jsx) ou 'erro: ...'
function PGN_hostState(hostPath) {
	var folder = new Folder(hostPath);

	if (!folder.exists) return 'erro: pasta do host inacessível (' + hostPath + ')';

	var src = PGN_sourceFolder(hostPath);

	if (src == null) return 'erro: fontes do script não encontrados (source/)';

	$.global.PGN_PENDING_SIG = PGN_hostSignature(folder) + '|' + PGN_hostSignature(src);

	if (typeof PGN != 'undefined' && PGN.ready && $.global.PGN_HOST_SIG === $.global.PGN_PENDING_SIG) return 'ok';
	return 'load';
}

// chamado logo depois de avaliar index.jsx...
function PGN_hostLoaded() {
	if (typeof PGN == 'undefined' || !PGN.ready) return 'erro: o host não carregou';

	$.global.PGN_HOST_SIG = $.global.PGN_PENDING_SIG;
	return 'loaded';
}
