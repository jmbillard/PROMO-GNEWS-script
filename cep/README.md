# PROMO GNEWS · extensão CEP

Versão em painel HTML do script, para **After Effects 2022 ou mais recente**, no **Windows e no macOS**. A lógica é a mesma do script ScriptUI (`source/`). A extensão só troca a interface.

```
INSTALAR PROMO GNEWS.jsx     instalador da equipe (rodar de dentro do After Effects)
cep/
  CSXS/manifest.xml          painel + 7 janelas (curvas, busca, templates, fontes, preferências, tags, end page)
  loader/stub.html           página instalada na máquina: abre a página de verdade na rede
  host/loader.jsx            confere se o host mudou na rede e manda recarregar
  host/index.jsx             carrega source/ (globals + libraries), platform.jsx, core.jsx e os tools
  host/platform.jsx          macOS × Windows: caminhos de rede, montagem de volumes, zip, fontes, clipboard
  host/core.jsx              PGN.register / PGN.run / PGN.fail · tarefas em passos (PGN.registerJob)
  host/tools/*.jsx           uma ferramenta por id (porte das abas do script)
  client/shared/             visual (base.css), ponte com o AE (bridge.js), helpers (ui.js)
  client/panel/              barra em sanfona (tools.js = registro das ferramentas)
  client/windows/*/          janelas próprias
  scripts/                   instaladores de desenvolvimento (macOS / Windows)
source/                      fontes do script clássico (usados pelo host)
```

## Instalar (equipe)

1. Na pasta do PROMO GNEWS na rede (a mesma estrutura deste repositório, com `cep/` e `source/`), abra o After Effects e vá em *File › Scripts › Run Script File…*.
2. Escolha `INSTALAR PROMO GNEWS.jsx` e siga o passo a passo.
3. Reinicie o After Effects e abra *Window › Extensions › PROMO GNEWS*.

O instalador faz três coisas:
- grava na máquina só um **carregador**: o manifest e uma página por painel ou janela;
- liga o `PlayerDebugMode` (CSXS 7 a 13);
- se você marcar a opção, remove o script ScriptUI antigo.

O código continua na rede. Para atualizar, basta trocar os arquivos lá e reabrir o painel. O instalador só precisa rodar de novo quando o `manifest.xml` mudar.

No macOS, o carregador procura a pasta da rede também nos volumes com sufixo (`/Volumes/cdesign-1` a `-5`). O host converte os caminhos UNC (`//servidor/share/...`) e as letras de drive para `/Volumes/...`, e monta o volume quando uma ferramenta precisa dele.

## Desenvolver

- **macOS:** `./cep/scripts/install-mac.sh` cria links para a pasta `cep` e para os fontes. Com `--copy` faz uma cópia fixa e com `--uninstall` remove.
- **Windows:** `powershell -ExecutionPolicy Bypass -File cep\scripts\install-win.ps1` faz uma cópia. Com `-Link` usa uma junção para o repositório e com `-Uninstall` remove.
- **Com Node:** `node tools/build-cep.js --dev` faz o mesmo que a instalação por link. `node tools/build-cep.js` gera `dist/com.promognews.cep`, uma pasta completa para assinar com o `ZXPSignCmd`.

Depois de editar:
- **HTML/CSS/JS:** feche e abra o painel.
- **`.jsx`:** reabra o painel. O carregador percebe a mudança e recarrega o host, sem reiniciar o After Effects.
- **`manifest.xml`:** reinicie o After Effects.

Para depurar, abra o DevTools no Chrome em `localhost:8091` (painel) ou nas portas 8092 a 8098 (janelas). As portas estão em `cep/.debug`.

As páginas também abrem direto no navegador, sem o After Effects. Nesse caso, toda chamada é simulada (`PGN.mock`), o que serve para ajustar o visual.

## Como funciona

- **Ferramentas:** cada botão chama `PGN.run(id, args)` no host. A resposta é `{ ok, msg, data }` ou `{ ok: false, error }`, e a mensagem também aparece no painel *Info* do After Effects.
- **Tarefas longas** (organizar, coletar arquivos/fontes, batch): rodam em passos curtos (`PGN.registerJob`). O painel chama um passo de cada vez e anima o progresso entre as chamadas:
  - anel no botão;
  - linha no rodapé;
  - porcentagem no indicador de seleção;
  - etapa em texto, quando o painel tem espaço.

  Clicar de novo no botão cancela a tarefa.
- **Botão direito:** chama a variante da ferramenta (`args.alt`). Em organizar projeto, abre a janela de tags. Em randomizar, sequenciar e quebrar linhas, abre um ajuste de valor dentro da sanfona.
- **Seleção:** o painel consulta a seleção (`PGN.status`) a cada 1,2 s e apaga as ferramentas que precisam de comp ou de layers.
- **Janelas:** são extensões `Modeless`. Elas reusam o mesmo engine do host e avisam o painel por eventos CEP (`com.promognews.toast`, `com.promognews.prefs`).
- **Dev:** a seção *Dev* aparece quando *ferramentas de dev* está ligado nas preferências.

### Cuidados (os mesmos do O PADEIRO)

- **Manifest:** usa `RequiredRuntime` CSXS **7.0** e os parâmetros `--enable-nodejs --mixed-context`. Sem isso, no After Effects 2025 para macOS, as janelas abertas com o After Effects já rodando ficam pretas.
- **ExtendScript é ES3:** nada de `let`, `const`, *arrow functions* ou template strings. Ternários encadeados (`a ? b : c ? d : e`) são avaliados como `(a ? b : c) ? d : e`, então use `if`/`else`.
- **Codificação:** os `.jsx` do host usam UTF-8 com BOM. Acentos em strings ficam como `\uXXXX`.
