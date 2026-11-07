# PROMO GNEWS · extensão CEP

Versão em painel HTML do script, para **After Effects 2022 ou mais recente** (CEP 11). A lógica é a mesma do script ScriptUI (`source/`). A extensão só troca a interface.

```
cep/
  CSXS/manifest.xml        painel + 5 janelas (curvas, busca, templates, fontes, preferências)
  host/index.jsx           carrega source/ (globals + libraries) e os tools
  host/core.jsx            PGN.register / PGN.run / PGN.fail / PGN.status
  host/tools/*.jsx         uma ferramenta por id (porte das abas do script)
  client/shared/           visual (base.css), ponte com o AE (bridge.js), helpers (ui.js)
  client/panel/            barra em sanfona (tools.js = registro das ferramentas)
  client/windows/*/        janelas próprias
```

## Instalar para desenvolvimento

1. Rode uma vez, na raiz do repositório:

   ```
   node tools/build-cep.js --dev
   ```

   O comando liga `source/` em `cep/host/src` e liga a pasta `cep` na pasta de extensões do CEP do usuário.
2. Libere extensões sem assinatura:
   - **Windows:** `reg add HKCU\Software\Adobe\CSXS.11 /v PlayerDebugMode /t REG_SZ /d 1 /f`
   - **Mac:** `defaults write com.adobe.CSXS.11 PlayerDebugMode 1`
3. Abra o After Effects e vá em *Window › Extensions › PROMO GNEWS*. A opção *Scripting & Expressions › Allow Scripts to Write Files and Access Network* precisa estar ligado.

Depois de editar:
- **HTML/CSS/JS:** feche e abra o painel, ou recarregue pelo DevTools.
- **`.jsx`:** reinicie o After Effects.

Para depurar, abra o DevTools no Chrome em `localhost:8091`. O painel usa a porta 8091 e as janelas usam de 8092 a 8096 (veja `cep/.debug`).

As páginas também abrem direto no navegador, sem o After Effects. Nesse caso, toda chamada é simulada com dados falsos (`PGN.mock`), o que serve para ajustar o visual.

## Empacotar

```
node tools/build-cep.js
```

Gera `dist/com.promognews.cep`, uma pasta completa com os fontes copiados em `host/src`. Para distribuir, assine com o `ZXPSignCmd` da Adobe e gere um `.zxp`. Outra opção é copiar a pasta para a pasta de extensões nas máquinas que já têm o PlayerDebugMode ligado.

## Como funciona

- **Ferramentas:** cada botão chama `PGN.run(id, args)` no host. A resposta é `{ ok, msg, data }` ou `{ ok: false, error }`, e a mensagem também aparece no painel *Info* do After Effects.
- **Botão direito:** chama a variante da ferramenta, passando `args.alt` (por exemplo, tags na organização do projeto ou pasta personalizada ao salvar). Em randomizar, sequenciar e quebrar linhas, o botão direito abre um ajuste de valor dentro da sanfona.
- **Seleção:** o painel consulta a seleção (`PGN.status`) a cada 1,2 s e apaga as ferramentas que precisam de comp ou de layers selecionados.
- **Janelas:** são extensões `Modeless`. Elas reusam o mesmo engine do host e avisam o painel por eventos CEP (`com.promognews.toast`, `com.promognews.prefs`).
- **Diálogos antigos:** alguns fluxos ainda abrem os diálogos ScriptUI originais (presets de end page, tags, progresso ao organizar ou coletar, batch).
