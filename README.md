# PROMO GNEWS *script*

**pt-BR** ⚡ algumas ferramentas para melhorar o workflow da equipe de motion de PROMO no After Effects ⚡

<br/>

# 📟 layout e interface

<!-- [ ] update print-->
![main menu](/images/menu.png)

a barra é **`responsiva`** e pode alternar entre os layouts *`horizontal`* e *`vertical`* ao ser redimensionada.<br/>
o menu principal é dividido em *`abas`* e possui os seguintes botões... 👇
<!-- [ ] update sections and description -->
~~~javascript
> controles e nulls             // hierarquias e afins...
> animação 
> efeitos
> texto                         // manipulação de texto... converte caixa alta e baixa!
> cores e guias
> layers                        // manipulação de layers...
> organização de projeto        // organiza tudo em pastinhas (não faz milagre mas é uma mão na roda)
> links úteis
> templates                     // templates do after...
> programa                      // configura algumas preferencias do after e media encoder...
> preferencias                  // preferencias do script...
~~~
> a *'cor'* de cada aba pode ser alterada nas *'preferências'* do *'script'*...

<br/><br/>

# ![control icon](/images/icons/ctrlIcon.png) *controles e nulls*

### ![null btn](/images/icons/shpNullIcon.png) botão **`null`**
cria um 'null' pai na mesma posição de cada layer selecionado.
    
>   caso não tenha nenhum layer selecionado, o *'null'* é criado no centro da tela.<br/>
>   o tipo de layer usado como *'null'* pode ser configurado nas *'preferências'* como *'solid'* ou *'shape layer'*...


<br/>

1. ### ![anim mod](/images/icons/tg_aniIcon.png) modificador **`copiar animação`**
    habilita a transferência dos 'key frames' de transformação dos layers selecionados para o 'null'.

```
    'anchor point'
    'posição'
    'escala'
    'rotação'
```
>    os *'key frames'* de *'opacidade'* não serão transferidos...

![copyAnim ex](/images/gifs/copy-animation.gif)

<br/>

2. ### ![expr mod](/images/icons/tg_expIcon.png) modificador **`copiar expressões`**
    habilita a transferência das 'expressões' de transformação dos layers selecionados para o 'null'.
```
    'anchor point'
    'posição'
    'escala'
    'rotação'
```
>    as *'expressões'* de *'opacidade'* não serão transferidas...

<br/>

### ![nullC btn](/images/icons/nullCBtn.png) botão **`null central`**
cria um único 'null' pai no 'centro geométrico' de 2 ou mais layers selecionados.

<br/>

### ![down btn](/images/icons/downIcon.png)![up btn](/images/icons/upIcon.png) botões de **`seleção de hierarquia`**
avança pela `hierarquia` dos layers selecionados... seleciona o pai ou todos os filhos.
<!---
    ![selectHierarchy ex](https://jmbillard.com.br/promo/gifs/select-hierarchy.gif)
--->
<br/><br/>

# ![animation icon](/images/icons/ctrlIcon.png) *animação*

### ![typewriter btn](/images/icons/typewriterIcon.png) botão **`typewriter`**
cria um preset para animação estilo digitação.

<br/>

| parâmetros | opções    |
| ---------- | --------- |
| texto      | 0% a 100% |

>   possui mais configurações na janela de *'controle de efeito'*...

<br/><br/>

# ![fx icon](/images/icons/fxIcon.png) *efeitos*

### ![adj btn](/images/icons/adjIcon.png) botão **`adjustment layer`**
    cria um 'adjustment layer' responsivo com as dimensões da composição.

>   o tipo de layer usado como *'adjustment layer'* pode ser configurado nas *'preferências'* como *'solid'* ou *'shape layer'*...

<br/>

### ![curves btn](/images/icons/fx_curIcon.png)![levels tab](/images/icons/fx_levIcon.png)![lumetri tab](/images/icons/fx_lumIcon.png)  botões **`correção de cor`**
```
    efeitos: 'curves'
             'levels'
             'lumetri color'
```

<br/><br/>

# ![text icon](/images/icons/titleCaseIcon.png) *texto*

### ![Title icon](/images/icons/upperCaseIcon.png) ![Title icon](/images/icons/lowerCaseIcon.png) ![Title icon](/images/icons/titleCaseIcon.png) botões de caixa **`ALTA`**, **`baixa`** e **`Título`**
converte todo o conteúdo dos layers de texto selecionados.

![lineBreaker ex](/images/gifs/text-case.gif)

<br/>

### ![txtCleaner btn](/images/icons/txtCleanerIcon.png) botão **`limpar texto`**
remove múltiplos espaços consecutivos, quebras de linha e faz o trim do layer de texto.

<br/>

### ![txtColumns btn](/images/icons/txtColumnsIcon.png) botão **`separar colunas`**
separa um layer de texto em 2 ou mais colunas cada coluna gera um novo layer de texto .

![columnBreaker ex](/images/gifs/column-breaker.gif)

<br/>

### slider **`quebra linhas`**
estabelece um limite de caracteres por linha e quebra o texto assim que esse limite é ultrapassado.

![lineBreaker ex](/images/gifs/line-breaker.gif)

<br/><br/>

# ![pallet icon](/images/icons/ctrlIcon.png) *paleta de cores*

### ![red btn](/images/colors/red.png) ![black btn](/images/colors/black.png) ![white btn](/images/colors/white.png)  botões **`paleta GNEWS`**
aplica um efeito 'fill' com a cor selecionada.

<br/>

| cores    | rgb           | #hex    |
| -------- | ------------- | ------- |
| vermelho | 185, 20, 20   | #B91414 |
| preto    | 20, 20, 20    | #141414 |
| branco   | 234, 234, 234 | #EAEAEA |

<br/>

### ![shapePallet btn](/images/icons/guides2Icon.png) botão **`paleta guia`**
cria um 'shape layer' com amostras da paleta no canto superior esquerdo.

<br/>

### ![logo btn](/images/icons/newsIcon.png) botão **`paleta guia`**
cria um 'shape layer' com a logo GNEWS.

<br/><br/>

# ![layers icon](/images/icons/layerIcon.png) *renomear / sequenciar layers*

<br/>

### botão **`renomear`**
renomeia todos os layers dos tipos habilitados.
- adiciona um 'prefixo' padrão.
- converte o nome para 'caixa baixa'.
- remove 'caracteres especiais'.
  
<br/>

>   no caso dos layers de texto o próprio conteúdo será usado como nome.

```
    ex: um layer de texto contendo...
        'Dia 8 às 20H' seria renomeado como 'txt_dia 8 as 20h'.
```

>   USE COM CAUTELA RENOMEAR LAYERS PODE FERRAR COM SUAS *'EXPRESSÕES'*!!!

<br/><br/>

1. ### ![footage mod](/images/icons/tg_ftgIcon.png) ![solid mod](/images/icons/tg_solIcon.png) ![shape mod](/images/icons/tg_shpIcon.png) ![text mod](/images/icons/tg_txtIcon.png) ![camera mod](/images/icons/tg_camIcon.png) ![light mod](/images/icons/tg_lgtIcon.png) modificadores **`tipos de layer`**
    habilita os tipos de layers que podem ser renomeados.

    <br/>

    | tipos de layer | prefixo padrão |
    | -------------- | -------------- |
    | footage        | ftg            |
    | solids         | sol            |
    | shapes         | shp            |
    | textos         | txt            |
    | cameras        | cam            |
    | luzes          | lgt            |

<br/>

### ![isolate btn](/images/icons/isolateIcon.png) botão **`isolar`**
habilita o 'shy' e esconde todos os layers selecionados.

<br/>

### ![lock btn](/images/icons/lockPropIcon.png) botão **`trancar`**
tranca todas as propriedades de transformação não animadas dos layers selecionados.
<!---
    ![lock ex](https://jmbillard.com.br/promo/gifs/lock.gif)
--->
```
    'anchor point'
    'posição'
    'escala'
    'rotação'
    'opacidade'
```

<br/><br/>

# ![tools icon](/images/icons/ctrlIcon.png) *rigs e ferramentas*

### ![counter btn](/images/icons/counterIcon.png) botão **`counter`**
cria rig de contagem usando um layer de texto.

<br/>

| parâmetros    | opções                 |
| ------------- | ---------------------- |
| modo          | número, ordinal, tempo |
| deslocamento  | 0% a 100%              |
| valor inicial | -999999999 a 999999999 |
| valor final   | -999999999 a 999999999 |

```
    ex: colocando os seguintes parâmetros...

        'modo' = número
        'deslocamento' = 0% >>> 100% [animado]
        'valor inicial' = -10
        'valor final' = 10

        o layer de texto será animado indo de '-10' a '10'.
```
>   cada modo possui várias configurações possíveis na janela de *'controle de efeito'*...

<br/>

### ![wig btn](/images/icons/wigIcon.png) botão **`wig`**
cria um rig simples de movimento usando a expressão 'wiggle' na 'posição' dos layers selecionados.

<br/>

| parâmetros | opções                 |
| ---------- | ---------------------- |
| frequência | 0 a 999999999          |
| amplitude  | -999999999 a 999999999 |

>   possui mais configurações na janela de *'controle de efeito'*...

<br/>

### ![ik btn](/images/icons/ikIcon.png) botão **`ik`**
cria um rig simples de movimento usando cinemática inversa com 3 layers selecionados em ordem.

![ik ex](/images/gifs/ik.gif)

<br/>

| parâmetros          | opções     |
| ------------------- | ---------- |
| inverter orientação | sim ou não |

<br/>

>   a 'ordem' de seleção deverá seguir a 'ordem' da hierarquia pretendida...

```
    ex: para o rig de uma perna a ordem de seleção seria...
        1 - coxa
        2 - canela
        3 - pé
```

<br/><br/>

# ![project icon](/images/icons/projIcon.png) *organização de projeto*

### ![add btn](/images/icons/addIcon.png) botão **`adicionar retranca`**
adiciona os seguintes itens do padrão de nomenclatura de promo no nome de cada comp selecionada:
- id do usuário > *3 primeiras letras do usuário logado na máquina.*
- tag 'PROMO' > *PROMO*
- id do projeto > *sigla de 3 letras do produto + 6 números da data*<br/><br/>
<!---
    ![lock ex](https://jmbillard.com.br/promo/gifs/add-prefix.gif)
--->
```
    ex: usando as seguintes informações ficaria...

        1 - usuário: jbillard > 'JBI'
        2 - tag: 'PROMO'
        3 - id do projeto: Edição das 16H - dia 20/07/22 > 'E16200722'

        'comp1' seria renomeada para 'JBI PROMO - E16200722 comp1'.
```
>   consulte a tabela de retrancas de *'PROMO'* para ver a lista completa de siglas dos produtos...

<br/>

### ![rename btn](/images/icons/shpNullIcon.png) botão **`renomear templates`**
renomeia as comps de templates e assinaturas de chamada seguindo o padrão de nomenclatura de promo.
- id do usuário > *3 primeiras letras do usuário logado na máquina.*
- tag 'PROMO' > *PROMO*
- id do projeto > *sigla de 3 letras do produto + 6 números da data*
- nome do projeto > *nome do projeto descrito no 'trello' de promo*
- serviço > *data e horário das versões em forma reduzida*
  
```
    ex: usando as seguintes informações ficaria...

        1 - usuário: rdenoni > 'RDE'
        2 - tag: 'PROMO'
        3 - id do projeto: GNEWS Internacional - dia 15/03/22 > 'INT150322'
        4 - nome do projeto: 'institucional'
        5 - serviço: Quinta-feira - 22:00 > 'QUI 22H'

        o template seria renomeado para 'RDE PROMO - INT150322 institucional QUI 22H'.
```

<br/>

### ![organize btn](/images/icons/orgProjIcon.png) botão **`organizar projeto`**
cria e organiza a estrutura do projeto seguindo o template de projeto.

<br/>

### ![save btn](/images/icons/quickSaveIcon.png) botão **`salvar projeto`**
abre a janela de seleção de caminho do 'sistema' e salva o projeto usando o padrão de nomenclatura de promo.
- id do projeto > *sigla de 3 letras do produto + 6 números da data*
- nome do projeto > *nome do projeto descrito no 'trello' de promo*

 ```
    ex: usando as seguintes informações ficaria...

        1 - id do projeto: Marketing - dia 08/11/22 > 'MKT081122'
        2 - nome do projeto: 'video comercial'

        o projeto seria renomeado para 'MKT081122 video comercial'.
```

<br/>

1. ### ![collect mod](/images/icons/tg_fldIcon.png) modificador **`coletar arquivos`**
    habilita a coleta de todos os arquivos usados no projeto quando salvo.

>   a copia dos arquivos pode demorar um pouco dependendo da quantidade e tamanho então *KEEP CALM*...

<br/>

2. ### ![fonts mod](/images/icons/tg_txtIcon.png) modificador **`coletar fontes`**
    habilita a coleta de todas as fontes usadas no projeto quando salvo.

>   limitação da *Adobe*: apenas as fontes instaladas na pasta de fontes do 'sistema' podem ser copiadas...

<br/><br/>

# ![links icon](/images/icons/linksIcon.png) *links úteis*

### botões **`office globo`**<br/>
[![email btn](/images/icons/link_emailIcon.png)**`webmail`**](https://outlook.office365.com/mail/)
[![oneDrive btn](/images/icons/link_oneDriveIcon.png)**`oneDrive`**](https://tvglobocorp-my.sharepoint.com/)
[![sharePoint btn](/images/icons/link_sharePointIcon.png)**`sharePoint`**](https://tvglobocorp.sharepoint.com/sites/IlhadeEdioPromo_GNews/Documentos%20Compartilhados/Forms/AllItems.aspx)

acessam os serviços que a 'globo' e a equipe de 'promo' usam na nuvem da 'microsoft'.
```
    urls: 'https://outlook.office365.com/mail/'
          'https://tvglobocorp-my.sharepoint.com/'
          'https://tvglobocorp.sharepoint.com/sites/IlhadeEdioPromo_GNews/Documentos%20Compartilhados'
```

<br/>

### botões **`work flow`**<br/>
[![trello btn](/images/icons/link_trelloIcon.png)**`trello`**](https://trello.com/promo126/home)
[![typeForm btn](/images/icons/link_typeFormIcon.png)**`typeForm`**](https://tvglobo.typeform.com/to/wiqX4z0X)
[![planner btn](/images/icons/link_plannerIcon.png)**`planner`**](https://tvglobocorp.sharepoint.com/sites/IlhadeEdioPromo_GNews/Documentos%20Compartilhados/Forms/AllItems.aspx)

acessam as plataformas que a 'globo' e a equipe de 'promo' usam para gerenciar tarefas.
```
    urls: 'https://trello.com/promo126/home'
          'https://tvglobo.typeform.com/to/wiqX4z0X'
          'https://tasks.office.com/tvglobocorp.onmicrosoft.com/en-US/Home/Planner/#/userboard'
```

<br/>

### botões **`rede`**<br/>
![arte btn](/images/icons/link_arteFolderIcon.png)**`para ARTE`**
![mag btn](/images/icons/link_magazineFolderIcon.png)**`upload MAGAZINE`**
![hn btn](/images/icons/link_hardNewsFolderIcon.png)**`upload HARD NEWS`**
![utils btn](/images/icons/link_utilsFolderIcon.png)**`UTILIDADES`**

acessam as pastas na rede da 'globo'.

>   clique direito: configura um caminho personalizado para as pastas *'para ARTE'* e *'upload MAGAZINE'*<br/>

<br/><br/>

# ![app icon](/images/icons/aeIcon.png) *programa*

### ![ameTemplate btn](/images/icons/eprIcon.png) botão **`AME presets`**
baixa e instala os principais presets de 'PROMO' no 'Media Encoder'.
- H264 - mp4 alta.epr
- H264 - mp4 baixa.epr
- WAV - audio GSAT.epr
- XDCAM HD 50 NTSC 60i - avid.epr

>   download: *'~\AppData\Roaming\PROMO GNEWS script\AME presets'*<br/>
>   instalação: *'~\Documents\Adobe\Adobe Media Encoder\versão instalada\Presets'*

<br/>

### ![template btn](/images/icons/openIcon.png) botão **`import templates`**
baixa e exibe os principais templates dos projetos de 'PROMO'.

- ![folder icon](/images/icons/tg_fldIcon.png) *CANAL*
  - ![folder icon](/images/icons/templateListIcon.png) *animacoes da marca.aet*
  - ![folder icon](/images/icons/templateListIcon.png) *historia ao vivo.aet*
- ![folder icon](/images/icons/tg_fldIcon.png) *claquete.aet*
- ![folder icon](/images/icons/tg_fldIcon.png) *ON-AIR*
  - ![folder icon](/images/icons/templateListIcon.png) *assinatura padrao*
  - ![folder icon](/images/icons/templateListIcon.png) *posicionamento*
- ![folder icon](/images/icons/tg_fldIcon.png) *PROGRAMAS*
  - ![folder icon](/images/icons/templateListIcon.png) *debate.aep*


>   clique direito: força o download das ultimas versões dos templates disponíveis do repositório<br/>
>   download: *'~\AppData\Roaming\PROMO GNEWS script\templates'*<br/>

<br/><br/>

# ![preferences icon](/images/icons/ctrlIcon.png) *preferencias*
as preferencias serão criadas e salvas sempre que uma alteração for feita.
>   preferencias: *'~\AppData\Roaming\PROMO GNEWS script\preferences.json'*

<br/>

### menu **`null - adjustment`**
define o tipo de 'layer' criado pelo script.
- shape layer
- solid

<br/>

### menu **`template de projeto`**
define o 'template' de organização do projeto.
- PROMO
- custom

<br/>

### botão **`cor atual`**
altera a 'cor' da aba selecionada.

<br/>

1. ### modificador **`aba`**
    define a 'aba' a ser alterada.
    - menu
    - controle
    - animação
    - efeitos
    - texto
    - paleta
    - layers
    - ferramentas
    - projeto
    - programa
    - links

<br/>

### ![update btn](/images/icons/downloadIcon.png) botão **`atualizar`**
baixa a ultima versão disponível no repositório do github

>   clique direito: acessa a pagina do repositório<br/>
>   download: *'~\AppData\Roaming\PROMO GNEWS script\ScriptUI Panels'*<br/>
>   instalação: *'versão instalada do After\Support Files\Scripts\ScriptUI Panels'*
