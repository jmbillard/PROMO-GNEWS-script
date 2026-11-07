#!/usr/bin/env bash
# Instala a extensão PROMO GNEWS no After Effects (macOS) para desenvolvimento.
# (para a equipe, use o 'INSTALAR PROMO GNEWS.jsx' direto da pasta na rede)
#
#   ./install-mac.sh             cria links (alterações valem após recarregar o painel)
#   ./install-mac.sh --copy      copia (instalação "fixa", com os fontes em host/src)
#   ./install-mac.sh --uninstall remove a extensão
#
# Extensões sem assinatura só carregam com o PlayerDebugMode ligado; o script liga para CSXS 7–13.
# (adaptado do O PADEIRO)
set -euo pipefail

cep="$(cd "$(dirname "$0")/.." && pwd)"
repo="$(cd "$cep/.." && pwd)"
dest="$HOME/Library/Application Support/Adobe/CEP/extensions/com.promognews.cep"

if [[ "${1:-}" == "--uninstall" ]]; then
	rm -rf "$dest"
	echo "removido: $dest"
	exit 0
fi

for v in 7 8 9 10 11 12 13; do
	defaults write "com.adobe.CSXS.$v" PlayerDebugMode 1
done

mkdir -p "$(dirname "$dest")"
rm -rf "$dest"

if [[ "${1:-}" == "--copy" ]]; then
	cp -R "$cep" "$dest"
	rm -rf "$dest/scripts" "$dest/host/src"
	cp -R "$repo/source" "$dest/host/src"
	echo "copiado para: $dest"
else
	# pelo link o host não enxerga ../../source: os fontes entram como host/src (ignorado pelo git)
	rm -rf "$cep/host/src"
	ln -s "$repo/source" "$cep/host/src"
	ln -s "$cep" "$dest"
	echo "link criado: $dest -> $cep"
fi

echo "reinicie o After Effects e abra: Window > Extensions > PROMO GNEWS"
