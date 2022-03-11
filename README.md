# PROMO GNEWS *script*

**pt-BR** ⚡ algumas ferramentas para melhorar o workflow da equipe de motion de PROMO no After Effects ⚡

<br/>

# 📟 layout e interface


![main menu](/images/menu.png)

a barra é **`responsiva`** e pode alternar entre os layouts *`horizontal`* e *`vertical`* ao ser redimensionada.<br/>
o menu principal é dividido em *`abas`* e possui os seguintes botões... 👇

~~~javascript
> controles e nulls             // hierarquias e afins...
> animação                      // work in progress... 
> efeitos
> texto                         // manipulação de texto... converte caixa alta e baixa!
> paleta de cores
> renomear / sequenciar layers
> rigs e ferramentas            // ferramentas diversas...
> organização de projeto        // organiza as mídias em pastinhas (não faz milagre mas é uma mão na roda)
> isolar layer                  // habilita o shy e esconde os layers não selecionados...
> links úteis                   // links web e pastas da rede...
> preferencias                  // configurações do script...
~~~
> a *'cor'* de cada aba pode ser configurada nas *'preferências'* do *'script'*...

<br/><br/>

# ![control icon](/images/icons/ctrlIcon.png) *controles e nulls*
<!---
![control tab](https://jmbillard.com.br/promo/ui/control%20tab.png)
--->
1. ### ![null btn](/images/icons/shpNullIcon.png) botão **`null`**
    cria um 'null' pai na mesma posição de cada layer selecionado.
    
>   caso não tenha nenhum layer selecionado, o 'null' é criado no centro da tela.<br/>
>   o tipo de layer usado como *'null'* pode ser configurado nas *'preferências'* como *'solid'* ou *'shape layer'*...

<br/>

2. ### ![anim mod](/images/icons/tg_aniIcon.png) modificador **`copiar animação`**
    habilita a transferência dos 'key frames' de transformação dos layers selecionados para o 'null'.

    ![copyAnim ex](https://jmbillard.com.br/promo/gifs/copy-animation.gif)

```
    'anchor point'
    'posição'
    'escala'
    'rotação'
```
>    os *'key frames'* de *'opacidade'* não serão transferidos...

<br/>

3. ### ![expr mod](/images/icons/tg_expIcon.png) modificador **`copiar expressões`**
    habilita a transferência das 'expressões' de transformação dos layers selecionados para o 'null'.
```
    'anchor point'
    'posição'
    'escala'
    'rotação'
```
>    as *'expressões'* de *'opacidade'* não serão transferidas...

<br/>

4. ### ![nullC btn](/images/icons/nullCBtn.png) botão **`null central`**
    cria um único 'null' pai no 'centro geométrico' de 2 ou mais layers selecionados.

<br/>

5. ### ![down btn](/images/icons/downIcon.png)![up btn](/images/icons/upIcon.png) botões de **`seleção de hierarquia`**
    avança pela `hierarquia` dos layers selecionados... seleciona o pai ou todos os filhos.

    ![selectHierarchy ex](https://jmbillard.com.br/promo/gifs/select-hierarchy.gif)

<br/><br/>

# ![animation icon](/images/icons/ctrlIcon.png) *animação*
<!---
![animation tab](https://jmbillard.com.br/promo/ui/animation%20tab.png)
--->
<br/><br/>

# ![fx icon](/images/icons/fxIcon.png) *efeitos*
<!---
![fx tab](https://jmbillard.com.br/promo/ui/fx%20tab.png)
--->
1. ### ![adj btn](/images/icons/adjIcon.png) botão **`adjustment layer`**
    cria um 'adjustment layer' responsivo com as dimensões da composição.

>   o tipo de layer usado como *'adjustment layer'* pode ser configurado nas *'preferências'* como *'solid'* ou *'shape layer'*...

<br/>

1. ### ![curves btn](/images/icons/fx_curIcon.png)![levels tab](/images/icons/fx_levIcon.png)![lumetri tab](/images/icons/fx_lumIcon.png)  botões **`correção de cor`**
```
    efeitos: 'curves'
             'levels'
             'lumetri color'
```

<br/><br/>

# ![text icon](/images/icons/ctrlIcon.png) *texto*
<!---
![text tab](https://jmbillard.com.br/promo/ui/text%20tab.png)
--->
1. ### botões caixa **`ALTA`**, **`baixa`** e **`Título`**
    converte todo o conteúdo dos layers de texto selecionados.

    ![lineBreaker ex](https://jmbillard.com.br/promo/gifs/text-case.gif)

<br/>

2. ### ![txtCleaner btn](/images/icons/txtCleanerIcon.png) botão **`limpar texto`**
    remove múltiplos espaços consecutivos, quebras de linha e faz o trim do layer de texto.

<br/>

3. ### ![txtColumns btn](/images/icons/txtColumnsIcon.png) botão **`separar colunas`**
    separa um layer de texto em 2 ou mais colunas e cria um novo layer de texto .

<br/>

4. ### slider **`quebra linhas`**
    estabelece um limite de caracteres por linha e quebra o texto assim que esse limite é ultrapassado.

    ![lineBreaker ex](https://jmbillard.com.br/promo/gifs/line-breaker.gif)

<br/><br/>

# ![pallet icon](/images/icons/ctrlIcon.png) *paleta de cores*
<!---
![pallet tab](https://jmbillard.com.br/promo/ui/pallet%20tab.png)
--->
1. ### ![red btn](/images/colors/red.png) ![black btn](/images/colors/black.png) ![white btn](/images/colors/white.png)  botões **`paleta GNEWS`**
    aplica um efeito 'fill' com a cor selecionada.

    ![lineBreaker ex](https://jmbillard.com.br/promo/gifs/pallet.gif)

    <br/>

    cores        | rgb             | #hex
    ------------ | --------------- | -------
     vermelho    |  185, 20, 20    |  #B91414
     preto       |  20, 20, 20     |  #141414
     branco      |  234, 234, 234  |  #EAEAEA

<br/>

2. ### ![shapePallet btn](/images/icons/tg_solIcon.png) botão **`paleta guia`**
    cria um 'shape layer' com amostras da paleta no canto superior esquerdo.

<br/><br/>

# ![layers icon](/images/icons/layerIcon.png) *renomear / sequenciar layers*
<!---
![layers tab](https://jmbillard.com.br/promo/ui/layers%20tab.png)
--->
1. ### ![footage mod](/images/icons/tg_ftgIcon.png) ![solid mod](/images/icons/tg_solIcon.png) ![shape mod](/images/icons/tg_shpIcon.png) ![text mod](/images/icons/tg_txtIcon.png) ![camera mod](/images/icons/tg_camIcon.png) ![light mod](/images/icons/tg_lgtIcon.png) modificadores **`tipos de layer`**
    habilita os tipos de layers que podem ser renomeados.

    <br/>

    tipos de layer | prefixo padrão
    -------------- | --------------
     footage       |  ftg
     solids        |  sol
     shapes        |  shp
     textos        |  txt
     cameras       |  cam
     luzes         |  lgt

<br/>

2. ### botão **`renomear`**
    renomeia todos os layers dos tipos habilitados.
    - adiciona um 'prefixo' padrão.
    - converte o nome para 'caixa baixa'.
    - remove 'caracteres especiais'.<br/><br/>

    ![rename ex](https://jmbillard.com.br/promo/gifs/rename.gif)

>   no caso dos layers de texto o próprio conteúdo será usado como nome.

```
    ex: um layer de texto contendo...
        'Dia 8 às 20H' seria renomeado como 'txt_dia 8 as 20h'.
```

>   USE COM CAUTELA RENOMEAR LAYERS PODE FERRAR COM SUAS *'EXPRESSÕES'*!!!

<br/>

3. ### botão **`trancar`**
    tranca todas as propriedades de transformação não animadas dos layers selecionados.

    ![lock ex](https://jmbillard.com.br/promo/gifs/lock.gif)

```
    'anchor point'
    'posição'
    'escala'
    'rotação'
    'opacidade'
```

<br/><br/>

# ![tools icon](/images/icons/ctrlIcon.png) *rigs e ferramentas*
<!---
![tools tab](https://jmbillard.com.br/promo/ui/tools%20tab.png)
--->
1. ### ![counter btn](/images/icons/counterIcon.png) botão **`counter`**
    cria rig de contagem usando um layer de texto.

    <br/>

    parâmetros    | opções
    ------------- | --------------
    modo          |  número, ordinal, tempo
    deslocamento  |  0% a 100%
    valor inicial |  -999999999 a 999999999
    valor final   |  -999999999 a 999999999


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

2. ### ![wig btn](/images/icons/wigIcon.png) botão **`wig`**
    cria um rig simples de movimento usando a expressão 'wiggle' na 'posição' dos layers selecionados.

    <br/>

    parâmetros     | opções
    -------------- | --------------
     frequência    |  0 a 999999999
     amplitude     |  -999999999 a 999999999

>   possui mais configurações na janela de *'controle de efeito'*...

<br/>

3. ### ![ik btn](/images/icons/wigIcon.png) botão **`ik`**
    cria um rig simples de movimento usando cinemática inversa com 3 layers selecionados em ordem.

    ![lineBreaker ex](https://jmbillard.com.br/promo/gifs/simple-ik.gif)

    <br/>

    parâmetros           | opções
    -------------------- | --------------
     inverter orientação |  sim ou não

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
<!---
![project tab](https://jmbillard.com.br/promo/ui/project%20tab.png)
--->
1. ### ![add btn](/images/icons/addIcon.png) botão **`adicionar retranca`**
    adiciona os seguintes itens do padrão de nomenclatura de promo no nome de cada comp selecionada:
    - id do usuário > *3 primeiras letras do usuário logado na máquina.*
    - tag 'PROMO' > *PROMO*
    - id do projeto > *sigla de 3 letras do produto + 6 números da data*<br/><br/>
    
    ![lock ex](https://jmbillard.com.br/promo/gifs/add-prefix.gif)

```
    ex: usando as seguintes informações ficaria...

        1 - usuário: jbillard > 'JBI'
        2 - tag: 'PROMO'
        3 - id do projeto: Edição das 16H - dia 20/07/22 > 'E16200722'

        'comp1' seria renomeada para 'JBI PROMO - E16200722 comp1'.
```
>   consulte a tabela de retrancas de *'PROMO'* para ver a lista completa de siglas dos produtos...

<br/>

2. ### ![rename btn](/images/icons/shpNullIcon.png) botão **`renomear templates`**
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

3. ### ![organize btn](/images/icons/orgProjIcon.png) botão **`organizar projeto`**
    cria e organiza a estrutura do projeto seguindo o template de projeto.

<br/>

4. ### ![collect mod](/images/icons/tg_fldIcon.png) modificador **`coletar arquivos`**
    habilita a coleta de todos os arquivos usados no projeto quando salvo.

>   a copia dos arquivos pode demorar um pouco dependendo da quantidade e tamanho então *KEEP CALM*...

<br/>

5. ### ![fonts mod]/images/icons/tg_txtIcon.png) modificador **`coletar fontes`**
    habilita a coleta de todas as fontes usadas no projeto quando salvo.

>   limitação da *Adobe*: apenas as fontes instaladas na pasta de fontes do 'sistema' podem ser copiadas...

<br/>

6. ### ![save btn](/images/icons/quickSaveIcon.png) botão **`salvar projeto`**
    abre a janela de seleção de caminho do 'sistema' e salva o projeto usando o padrão de nomenclatura de promo.
    - id do projeto > *sigla de 3 letras do produto + 6 números da data*
    - nome do projeto > *nome do projeto descrito no 'trello' de promo*

 ```
    ex: usando as seguintes informações ficaria...

        1 - id do projeto: Marketing - dia 08/11/22 > 'MKT081122'
        2 - nome do projeto: 'video comercial'

        o projeto seria renomeado para 'MKT081122 video comercial'.
```

<br/><br/>

# ![links icon](/images/icons/linksIcon.png) *links úteis*
<!---
![links tab](https://jmbillard.com.br/promo/ui/link%20tab.png)
--->
1. ### botões **`office globo`**
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

2. ### botões **`work flow`**
    [![trello btn](https://jmbillard.com.br/promo/ui/menu/links_tab/trello.png)**`trello`**](https://trello.com/promo126/home)
    [![typeForm btn](https://jmbillard.com.br/promo/ui/menu/links_tab/type%20form.png)**`typeForm`**](https://tvglobo.typeform.com/to/wiqX4z0X)
    [![planner btn](https://jmbillard.com.br/promo/ui/menu/links_tab/plannerIcon.png)**`planner`**](https://tvglobocorp.sharepoint.com/sites/IlhadeEdioPromo_GNews/Documentos%20Compartilhados/Forms/AllItems.aspx)

    acessam as plataformas que a 'globo' e a equipe de 'promo' usam para gerenciar tarefas.
```
    urls: 'https://trello.com/promo126/home'
          'https://tvglobo.typeform.com/to/wiqX4z0X'
          'https://tasks.office.com/tvglobocorp.onmicrosoft.com/en-US/Home/Planner/#/userboard'
```

<br/><br/>

# ![preferences icon](/images/icons/ctrlIcon.png) *preferencias*
<!---
![preferences tab](https://jmbillard.com.br/promo/ui/preferences%20tab.png)
--->
1. ### texto **`usuário`**
    define o prefixo do 'usuário'.

<br/>

2. ### menu **`null - adjustment`**
    define o tipo de 'layer' criado pelo script.

<br/>

3. ### menu **`template de projeto`**
    define o 'template' de organização do projeto.

<br/>

4. ### modificador **`aba`**
    define a 'aba' a ser alterada.

<br/>

5. ### botão **`cor atual`**
    altera a 'cor' da aba selecionada.

<br/>

6. ### botão **`limpar preferences`**
    descarta qualquer alteração feita pelo usuário e usa as 'preferencias' padrão.