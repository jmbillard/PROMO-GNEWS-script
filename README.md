<!--  linter settings:
//  jshint -W061 -->

# PROMO GNEWS *script*

**pt-BR** ⚡ algumas ferramentas para melhorar o workflow da equipe de motion em PROMO na ![logo](/images/GNEWS_LOGO%20dark.png)

## 📟 layout e interface

![menu](/images/menu.png)

a barra pode alternar entre os layouts *`horizontal`* e *`vertical`* ao ser redimensionada.
a tela inicial é dividida por temas e possui as seguintes [ **seções** ] e **ferramentas**...

```markdown
    - [controles]         →   hierarquias, nulls e afins...
    - [animação]
    - [efeitos]
    - [texto]             →   manipulação de layers de texto...
    - [guias]
    - [projeto]           →   organiza tudo em pastinhas...
    - [links]
    - templates
    - busca
    - preview
    - [programa]          →   configurações do after e media encoder...
    - [dev]               →   ferramentas de desenvolvimento...
    - [preferencias]      →   preferencias do script...
```

> a *'cor'* da tela inicial e suas seções podem ser alteradas nas *'preferências do script'*...
---

<br /><br />

# ![ctrl icon](/images/icons/0%20-%20menu/ctrlIcon%20dark.png) [ seção *controles* ]

![info](/images/icons/general/infoIcon%20dark.png) → abre a documentação | ajuda da seção.

---
<br />

## ![null btn](/images/icons/1%20-%20controls/nullIcon%20dark.png) botão **`null`**

cria um 'null' pai na mesma posição de cada layer selecionado.

> caso não tenha nenhum layer selecionado, o *'null'* é criado no centro da tela.\
> o tipo de layer usado como *'null'* pode ser configurado nas *'preferências'* como *'solid'* ou *'shape layer'*...

1. ### ![copy animation tg](/images/icons/general/toggles/aniToggleIcon%20dark.png) modificador **`copiar animação`**

    habilita a transferência dos 'key frames' de transformação dos layers selecionados para o 'null'.

    ```markdown
        'anchor point'
        'posição'
        'escala'
        'rotação'
    ```

    > os *'key frames'* de *'opacidade'* não serão transferidos...

    ![copy animation ex](/images/gifs/copy-animation.gif)

2. ### ![expression](/images/icons/general/toggles/expToggleIcon%20dark.png) modificador **`copiar expressões`**

    habilita a transferência das 'expressões' de transformação dos layers selecionados para o 'null'.

    ```markdown
        'anchor point'
        'posição'
        'escala'
        'rotação'
    ```

    > as *'expressões'* de *'opacidade'* não serão transferidas...
<!-- [ ] ex: copiar expressões -->
---
<br />

### ![central null btn](/images/icons/1%20-%20controls/nullCenter%20dark.png) botão **`null central`**

cria um único 'null' pai no 'centro geométrico' de 2 ou mais layers selecionados.

---
<br />

### ![down btn](/images/icons/general/downIcon%20dark.png)![up btn](/images/icons/general/upIcon%20dark.png) botões de **`seleção de hierarquia`**

avança pela `hierarquia` dos layers selecionados... seleciona o pai ou todos os filhos.

<!-- [ ] ex: seleção de hierarquia -->
---

<br /><br />

# ![animation icon](/images/icons/0%20-%20menu/animationIcon%20dark.png) [ seção *animação* ]

![info](/images/icons/general/infoIcon%20dark.png) → abre a documentação | ajuda da seção.

---
<br />

## ![copy inf btn](/images/icons/2%20-%20animation/copyInfluenceIcon%20dark.png) botão **`copiar influência`**

copia as seguintes propriedades do keyframe selecionado:

```markdown
    ↑ influência de entrada
    ↑ influência de saída
    ↑ velocidade de entrada
    ↑ velocidade de saída
```

1) ### ![key stat 1](/images/icons/2%20-%20animation/preview%20keyframe/keyStat1Icon%20dark.png) ![key stat 2](/images/icons/2%20-%20animation/preview%20keyframe/keyStat2Icon%20dark.png) ![key stat 3](/images/icons/2%20-%20animation/preview%20keyframe/keyStat3Icon%20dark.png) ![key stat 4](/images/icons/2%20-%20animation/preview%20keyframe/keyStat4Icon%20dark.png) ![key stat 5](/images/icons/2%20-%20animation/preview%20keyframe/keyStat5Icon%20dark.png) ![key stat 6](/images/icons/2%20-%20animation/preview%20keyframe/keyStat6Icon%20dark.png) ![key stat 7](/images/icons/2%20-%20animation/preview%20keyframe/keyStat7Icon%20dark.png) ![key stat 8](/images/icons/2%20-%20animation/preview%20keyframe/keyStat8Icon%20dark.png) ![key stat 9](/images/icons/2%20-%20animation/preview%20keyframe/keyStat9Icon%20dark.png) keyframe stats

    info sobre as propriedades copiadas do keyframe selecionado

## ![paste inf btn](/images/icons/2%20-%20animation/pasteInfluenceIcon%20dark.png) botão **`colar influência`**

substitui as seguintes propriedades do keyframe selecionado:

```markdown
    ↓ influência de entrada
    ↓ influência de saída
    ↓ velocidade de entrada
    ↓ velocidade de saída
```

<!-- [ ] ex: copiar e colar influencias -->
---
<br />

## ![lock btn](/images/icons/2%20-%20animation/lockPropIcon%20dark.png) botão **`trancar`**

tranca todas as propriedades de transformação não animadas dos layers selecionados.
<!---
    ![lock ex](https://jmbillard.com.br/promo/gifs/lock.gif)
--->
```markdown
    'anchor point'
    'posição'
    'escala'
    'rotação'
    'opacidade'
```
<!-- [ ] ex: bloquear propriedades de transformação -->
---
<br />

## ![randomize layers btn](/images/icons/2%20-%20animation/randomizeLayerTimesIcon%20dark.png) botão **`randomizar layers`**

avança e atrasa os tempos de entrada e saída de cada layer selecionado entre o primeiro e último tempos de entrada.
> caso os layers selecionados tenham o mesmo tempo de entrada todos serão deslocados entre 0 e 1 segundo.
<!-- [ ] ex: randomizar layers -->
---
<br /><br />

# ![tools btn](/images/icons/2%20-%20animation/rigToolsIcon%20dark.png) [ subseção **`ferramentas`** ]

![info](/images/icons/general/infoIcon%20dark.png) → abre a documentação | ajuda da seção.

---
<br />

## ![arrow btn](/images/icons/2%20-%20animation/tools/arrowIcon%20dark.png) botão **`seta`**

preset de seta com controles diversos.
> configurações da janela de *'controle de efeito'*...\
> [documentação completa](/docs/doc.md)
<!-- [ ] ex: seleção de hierarquia -->
---
<br />

## ![counter btn](/images/icons/2%20-%20animation/tools/counterIcon%20dark.png) botão **`counter`**

cria rig de contagem usando um layer de texto.

```markdown
    ex: colocando os seguintes parâmetros...

        'modo' = número
        'deslocamento' = 0% >>> 100% [animado]
        'valor inicial' = -10
        'valor final' = 10

        o layer de texto será animado indo de '-10' a '10'.
```

> cada modo possui configurações na janela de *'controle de efeito'*...\
> [documentação completa](/docs/doc.md)

## ![typewriter btn](/images/icons/2%20-%20animation/tools/typewriterIcon_1%20dark.png) botão **`digitação`**

lettering com animação padrão estilo digitação.
> configurações da janela de *'controle de efeito'*...\
> [documentação completa](/docs/doc.md)
<!-- [ ] ex: typewriter -->

## ![words btn](/images/icons/2%20-%20animation/tools/wordsIcon%20dark.png) botão **`palavras`**

lettering com animação padrão palavra por palavra.
> configurações da janela de *'controle de efeito'*...\
> [documentação completa](/docs/doc.md)
<!-- [ ] ex: words -->

## ![box btn](/images/icons/2%20-%20animation/tools/boxIcon%20dark.png) botão **`tarja simples`**

cria uma tarja simples no layer selecionado.

---
<br />

## ![wig btn](/images/icons/2%20-%20animation/tools/wigIcon%20dark.png) botão **`wig`**

cria um rig simples de movimento usando a expressão 'wiggle' na 'posição' dos layers selecionados.
> configurações na janela de *'controle de efeito'*...\
> [documentação completa](/docs/doc.md)
<!-- [ ] ex: wig -->

---
<br />

## ![ik btn](/images/icons/2%20-%20animation/tools/ikIcon%20dark.png) botão **`ik`**

cria um rig simples de movimento usando cinemática inversa com 3 layers selecionados em ordem.
![ik ex](/images/gifs/ik.gif)
> a 'ordem' de seleção deverá seguir a 'ordem' da hierarquia pretendida...

```markdown
    ex: para o rig de uma perna a ordem de seleção seria...
        1 - coxa
        2 - canela
        3 - pé
```

---

<br /><br />

# ![fx icon](/images/icons/0%20-%20menu/effectsIcon%20dark.png) [ seção *efeitos* ]

![info](/images/icons/general/infoIcon%20dark.png) → abre a documentação | ajuda da seção.

---
<br />

## ![adj btn](/images/icons/3%20-%20effects/adjIcon%20dark.png) botão **`adjustment layer`**

cria um 'adjustment layer' responsivo com as dimensões da composição.

> o tipo de layer usado como *'adjustment layer'* pode ser configurado nas *'preferências'* como *'solid'* ou *'shape layer'*...

## ![curves btn](/images/icons/3%20-%20effects/fx_curIcon%20dark.png)![levels tab](/images/icons/3%20-%20effects/fx_levIcon%20dark.png)![lumetri tab](/images/icons/3%20-%20effects/fx_lumIcon%20dark.png)  botões **`correção de cor`**

```markdown
    efeitos: 'curves'
             'levels'
             'lumetri color'
```

---

<br /><br />

# ![text icon](/images/icons/4%20-%20text/titleCaseIcon%20dark.png) [ seção *texto* ]

![info](/images/icons/general/infoIcon%20dark.png) → abre a documentação | ajuda da seção.

---
<br />

## ![Title icon](/images/icons/4%20-%20text/upperCaseIcon%20dark.png) ![Title icon](/images/icons/4%20-%20text/lowerCaseIcon%20dark.png) ![Title icon](/images/icons/4%20-%20text/titleCaseIcon%20dark.png) botões de caixa **`ALTA`**, **`baixa`** e **`Título`**

converte todo o conteúdo dos layers de texto selecionados.

![lineBreaker ex](/images/gifs/text-case.gif)

## ![txtCleaner btn](/images/icons/4%20-%20text/cleanerIcon%20dark.png) botão **`limpar texto`**

remove múltiplos espaços consecutivos, quebras de linha e faz o trim do layer de texto.
<!-- [ ] ex: limpador de texto -->

## ![txtColumns btn](/images/icons/4%20-%20text/txtColumnsIcon%20dark.png) botão **`separar colunas`**

separa um layer de texto em 2 ou mais colunas cada coluna gera um novo layer de texto .

![columnBreaker ex](/images/gifs/column-breaker.gif)

---
<br />

## ![slider](/images/icons/general/ui/sliderIcon%20dark.png) **`quebra linhas`**

estabelece um limite de caracteres por linha e quebra o texto assim que esse limite é ultrapassado.

![lineBreaker ex](/images/gifs/line-breaker.gif)

---

<br /><br />

# ![guides icon](/images/icons/0%20-%20menu/brandIcon%20dark.png) [ seção *guias* ]

![info](/images/icons/general/infoIcon%20dark.png) → abre a documentação | ajuda da seção.

---
<br />

## botões **`paleta GNEWS`**

aplica um efeito 'fill' com a cor selecionada.
  
| cor                                | rgb           | #hex    |
| ----------------------------------- | ------------- | ------- |
| ![color](/images/colors/E52F2E.png) | 229, 49, 49   | #E52F2E |
| ![color](/images/colors/ECFF8C.png) | 238, 255, 140 | #ECFF8C |
| ![color](/images/colors/221E1D.png) | 35, 30, 30    | #221E1D |

| cor                                | rgb           | #hex    |
| ----------------------------------- | ------------- | ------- |
| ![color](/images/colors/141414.png) | 20, 20, 20    | #141414 |
| ![color](/images/colors/333333.png) | 51, 51, 51    | #333333 |
| ![color](/images/colors/4A4A4A.png) | 74, 74, 74    | #4A4A4A |
| ![color](/images/colors/B2B2B2.png) | 178, 178, 178 | #B2B2B2 |
| ![color](/images/colors/F2F2F2.png) | 242, 242, 242 | #F2F2F2 |

| cor                                 | rgb           | #hex    |
| ----------------------------------- | ------------- | ------- |
| ![color](/images/colors/F13333.png) | 242, 51, 51   | #F13333 |
| ![color](/images/colors/FF4D4D.png) | 255, 77, 77   | #FF4D4D |
| ![color](/images/colors/FE674C.png) | 255, 103, 77  | #FE674C |
| ![color](/images/colors/FF8F4D.png) | 255, 143, 77  | #FF8F4D |
| ![color](/images/colors/FFC44E.png) | 255, 196, 78  | #FFC44E |
| ![color](/images/colors/FF5A68.png) | 255, 90, 103  | #FF5A68 |
| ![color](/images/colors/FF739A.png) | 255, 115, 154 | #FF739A |
| ![color](/images/colors/FF8CCD.png) | 255, 140, 205 | #FF8CCD |
| ![color](/images/colors/B5ADFF.png) | 181, 173, 255 | #B5ADFF |
| ![color](/images/colors/80C0FE.png) | 128, 192, 255 | #80C0FE |
| ![color](/images/colors/5DE6A2.png) | 92, 230, 161  | #5DE6A2 |

## ![shapePallet btn](/images/icons/general/paleta%20dark.png) botão **`paleta`**

cria um 'shape layer' com amostras da paleta.
> guide layer e bloqueado.
<!-- [ ] ex: paleta shape layer -->

---
<br />

## ![arrow on-air btn](/images/icons/5%20-%20brand/arrowOnAirIcon%20dark.png) botão **`seta on-air`**

cria um 'shape layer' com a seta usada no on-air.

## ![logo btn](/images/icons/5%20-%20brand/newsIcon%20dark.png) botão **`logo estático`**

cria um 'shape layer' com a logo GNEWS estática.

## ![logo btn](/images/icons/5%20-%20brand/newsAnimIcon%20dark.png) botão **`logo animado`**

cria um 'shape layer' com a logo GNEWS animada.
> animação padrão de 3 segundos.\
> a animação iniciará no tempo atual da comp selecionada.
<!-- [ ] ex: logo animado -->

---

<br /><br />
<!-- 
## ![layers icon](/images/icons/layerIcon.png) *renomear / sequenciar layers*
### botão **`renomear`**
renomeia todos os layers dos tipos habilitados.
- adiciona um 'prefixo' padrão.
- converte o nome para 'caixa baixa'.
- remove 'caracteres especiais'.
> no caso dos layers de texto o próprio conteúdo será usado como nome.
```markdown
    ex: um layer de texto contendo
        'Dia 8 às 20H' seria renomeado como 'txt_dia 8 as 20h'.
```
> USE COM CAUTELA RENOMEAR LAYERS PODE FERRAR COM SUAS *'EXPRESSÕES'*!!!
1. ### ![footage mod](/images/icons/tg_ftgIcon.png) ![solid mod](/images/icons/tg_solIcon.png) ![shape mod](/images/icons/tg_shpIcon.png) ![text mod](/images/icons/tg_txtIcon.png) ![camera mod](/images/icons/tg_camIcon.png) ![light mod](/images/icons/tg_lgtIcon.png) modificadores **`tipos de layer`**
    habilita os tipos de layers que podem ser renomeados.
    | tipos de layer | prefixo padrão |
    | -------------- | -------------- |
    | footage        | ftg            |
    | solids         | sol            |
    | shapes         | shp            |
    | textos         | txt            |
    | cameras        | cam            |
    | luzes          | lgt            |
### ![isolate btn](/images/icons/isolateIcon.png) botão **`isolar`**
habilita o 'shy' e esconde todos os layers selecionados.
---
<br /> -->

# ![project icon](/images/icons/0%20-%20menu/projectIcon%20dark.png) [ seção *projeto* ]

![info](/images/icons/general/infoIcon%20dark.png) → abre a documentação | ajuda da seção.

---
<br />

## ![add btn](/images/icons/general/addIcon%20dark.png) botão **`adicionar retranca`**

adiciona os seguintes itens do padrão de nomenclatura de promo no nome de cada comp selecionada:

- id do usuário > *3 primeiras letras do usuário logado na máquina.*
- tag 'PROMO' > *PROMO*
- id do projeto > *sigla de 3 letras do produto + 6 números da data*
<!-- [ ] ex: adicionar retranca -->

```markdown
    ex: usando as seguintes informações ficaria...

        1 - usuário: jbillard → 'JBI'
        2 - tag: 'PROMO'
        3 - id do projeto: Edição das 16H - dia 20/07/22 → 'E16200722'

        'comp1' seria renomeada para 'JBI PROMO - E16200722 comp1'.
```

> consulte a tabela de retrancas de *'PROMO'* para ver a lista completa de siglas dos produtos...

## ![rename btn](/images/icons/general/checkIcon%20dark.png) botão **`renomear templates`**

renomeia as comps de templates e assinaturas de chamada seguindo o padrão de nomenclatura de promo.

- id do usuário > *3 primeiras letras do usuário logado na máquina.*
- tag 'PROMO' > *PROMO*
- id do projeto > *sigla de 3 letras do produto + 6 números da data*
- nome do projeto > *nome do projeto descrito no 'trello' de promo*
- serviço > *data e horário das versões em forma reduzida*
  
```markdown
    ex: usando as seguintes informações ficaria...

        1 - usuário: rdenoni → 'RDE'
        2 - tag: 'PROMO'
        3 - id do projeto: GNEWS Internacional - dia 15/03/22 > 'INT150322'
        4 - nome do projeto: 'institucional'
        5 - serviço: Quinta-feira - 22:00 → 'QUI 22H'

        o template seria renomeado para 'RDE PROMO - INT150322 institucional QUI 22H'.
```
<!-- [ ] ex: renomear template -->

---
<br />

## ![organize btn](/images/icons/6%20-%20project/templateIcon%20dark.png) botão **`organizar projeto`**

cria e organiza a estrutura do projeto seguindo o modelo de projeto.
> modelo de projeto pode ser alterado nas *'preferências do script'*...
<!-- [ ] ex: organizar projeto -->

> click direito -> aplica tags de organização nos itens selecionados da *'janela de projeto'*.

- ![exportar btn](/images/icons/general/toggles/ftgToggleIcon%20dark.png) exportar
- ![editar btn](/images/icons/general/toggles/compToggleIcon%20dark.png) editar
- ![ignorar btn](/images/icons/general/toggles/solToggleIcon%20dark.png) ignorar
- ![fundo btn](/images/icons/general/toggles/imgToggleIcon%20dark.png) fundo
- ![foto btn](/images/icons/general/toggles/imgToggleIcon%20dark.png) foto
- ![ref btn](/images/icons/general/toggles/imgToggleIcon%20dark.png) ref
- ![logo btn](/images/icons/general/toggles/shpToggleIcon%20dark.png) logo
- ![ícone btn](/images/icons/general/toggles/shpToggleIcon%20dark.png) ícone
- ![textura btn](/images/icons/general/toggles/matteToggleIcon%20dark.png) textura
- ![padrão btn](/images/icons/general/toggles/matteToggleIcon%20dark.png) padrão
- ![módulo btn](/images/icons/general/toggles/matteToggleIcon%20dark.png) módulo
- ![tarja btn](/images/icons/general/toggles/txtToggleIcon%20dark.png) tarja
- ![música btn](/images/icons/general/toggles/sonoToggleIcon%20dark.png) música
- ![locução btn](/images/icons/general/toggles/sonoToggleIcon%20dark.png) locução
- ![assinatura btn](/images/icons/general/toggles/compToggleIcon%20dark.png) assinatura *'end page'*
- ![abertura btn](/images/icons/general/toggles/compToggleIcon%20dark.png) abertura

---
<br />

## ![end page btn](/images/icons/6%20-%20project/endpagePresetIcon%20dark.png) botão **`modelos de assinatura`**

seleciona, modifica, aplica e salva modelos do template de assinatura *'end page'*.
> [documentação completa](/docs/doc.md)
<!-- [ ] ex: modelos de assinatura -->

---
<br />

## ![save btn](/images/icons/6%20-%20project/quickSaveIcon%20dark.png) botão **`salvar projeto`**

abre a janela de seleção de caminho do 'sistema' e salva o projeto usando o padrão de nomenclatura de promo.

- id do projeto > *sigla de 3 letras do produto + 6 números da data*
- nome do projeto > *nome do projeto descrito no 'trello' de promo*

 ```markdown
    ex: usando as seguintes informações ficaria...

        1 - id do projeto: Marketing - dia 08/11/22 → 'MKT081122'
        2 - nome do projeto: 'video comercial'

        o projeto seria renomeado para 'MKT081122 video comercial'.
```

1. ### ![collect mod](/images/icons/general/toggles/fldToggleIcon%20dark.png) modificador **`coletar arquivos`**

    habilita a coleta de todos os arquivos usados no projeto quando salvo.
    > 'collect files'...

2. ### ![fonts mod](/images/icons/general/toggles/txtToggleIcon%20dark.png) modificador **`coletar fontes`**

    habilita a coleta de todas as fontes usadas no projeto quando salvo.
    > limitação da *Adobe*: apenas as fontes instaladas na pasta de fontes do 'sistema' podem ser copiadas...

---

<br /><br />

# ![links icon](/images/icons/0%20-%20menu/shortcutsIcon%20dark.png) [ seção *links* ]

![info](/images/icons/general/infoIcon%20dark.png) → abre a documentação | ajuda da seção.

---
<br />

## botões **`office globo`**

[![oneDrive btn](/images/icons/7%20-%20shortcuts/oneDriveIcon%20dark.png)**`oneDrive`**](https://tvglobocorp-my.sharepoint.com/)

acessa o oneDrive da conta 'globo'.

```markdown
    urls: 'https://tvglobocorp-my.sharepoint.com/'
```

## botões **`work flow`**

[![trello btn](/images/icons/7%20-%20shortcuts/trelloIcon%20dark.png)**`trello`**](https://trello.com/promo126/home)
[![typeForm btn](/images/icons/7%20-%20shortcuts/typeFormIcon%20dark.png)**`typeForm`**](https://tvglobo.typeform.com/to/wiqX4z0X)
[![planner btn](/images/icons/7%20-%20shortcuts/plannerIcon%20dark.png)**`planner`**](https://tvglobocorp.sharepoint.com/sites/IlhadeEdioPromo_GNews/Documentos%20Compartilhados/Forms/AllItems.aspx)

acessam as plataformas que a 'globo' e a equipe de 'promo' usam para gerenciar tarefas.

```markdown
    urls: 'https://trello.com/promo126/home'
          'https://tvglobo.typeform.com/to/wiqX4z0X'
          'https://tasks.office.com/tvglobocorp.onmicrosoft.com/en-US/Home/Planner/#/userboard'
```

---
<br />

## botões **`rede`**

![arte btn](/images/icons/7%20-%20shortcuts/arteFolderIcon%20dark.png)**`para ARTE`**\
![mag btn](/images/icons/7%20-%20shortcuts/magazineFolderIcon%20dark.png)**`upload MAGAZINE`**\
![hn btn](/images/icons/7%20-%20shortcuts/hardNewsFolderIcon%20dark.png)**`upload HARD NEWS`**\
![utils btn](/images/icons/7%20-%20shortcuts/utilsFolderIcon%20dark.png)**`N:\UTILIDADES`**\
![base btn](/images/icons/7%20-%20shortcuts/baseFolderIcon%20dark.png)**`_Bases Jornais`**\
![day btn](/images/icons/7%20-%20shortcuts/dayFolderIcon%20dark.png)**`PRODUCAO DIA-A-DIA\...\[Hoje]`**

acessam as pastas na rede da 'globo'.

> um caminho personalizado para as pastas *'para ARTE'* e *'upload MAGAZINE'* pode ser configurado nas *'preferências do script'*...

---

<br /><br />

# ![template btn](/images/icons/0%20-%20menu/templatesIcon%20dark.png) janela **`templates`**

baixa e exibe os principais templates dos projetos de 'PROMO'.

> download: *'~\AppData\Roaming\PROMO GNEWS script\templates'*\
> [documentação completa](/docs/doc.md)

---

<br /><br />

# ![find btn](/images/icons/0%20-%20menu/findIcon%20dark.png) janela **`busca`**

executa uma busca pelo termo pesquisado no conteúdo dos *'text layers'*.

> caso nenhuma composição esteja selecionada na *'janela de projeto'*, a busca englobará todas as composições.\
> [documentação completa](/docs/doc.md)

---

<br /><br />

# ![snap btn](/images/icons/0%20-%20menu/previewIcon%20dark.png) botão **`preview`**

exporta o frame atual da comp selecionada em *'.png'*.

> por padrão o arquivo será nomeado como *'**nome da comp** preview.png'*.

---

<br /><br />

# ![app icon](/images/icons/0%20-%20menu/appIcon%20dark.png) [ seção *programa* ]

![info](/images/icons/general/infoIcon%20dark.png) → abre a documentação | ajuda da seção.

---
<br />

## ![fonts btn](/images/icons/general/file%20types/fontsIcon%20dark.png) botão **`fontes`**

baixa e instala as fontes do *'ON-AIR'* entre outras.

- Degular
- Suisse

> download: *'~\AppData\Roaming\PROMO GNEWS script\fonts'*\
> [documentação completa](/docs/doc.md)

---
<br />

## ![ameTemplate btn](/images/icons/general/file%20types/eprIcon%20dark.png) botão **`AME presets`**

baixa e instala os principais presets de 'PROMO' no 'Media Encoder'.

- H264 - mp4 alta.epr
- H264 - mp4 baixa.epr
- WAV - audio GSAT.epr
- XDCAM HD 50 NTSC 60i - avid.epr

> download: *'~\AppData\Roaming\PROMO GNEWS script\AME presets'*\
> instalação: *'~\Documents\Adobe\Adobe Media Encoder\versão instalada\Presets'*

---

<br /><br />

# ![preferences icon](/images/icons/0%20-%20menu/preferencesIcon%20dark.png) janela *preferencias*

> [documentação completa](/docs/preferences.md)
