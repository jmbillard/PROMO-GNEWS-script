# PROMO GNEWS

**pt-BR** ⚡ extensão do After Effects com as ferramentas da equipe de motion em PROMO na ![logo](images/GNEWS_LOGO%20dark.png)

After Effects 2022 ou mais novo, no **Windows e no macOS**: uma barra em sanfona com as ferramentas do dia a dia e janelas próprias para as tarefas maiores.

![abertura da barra](images/doc/gifs/abertura.gif)

- [instalar](#instalar)
- [a barra](#a-barra)
- [seções e ferramentas](#seções-e-ferramentas)
- [janelas](#janelas)
- [desenvolvimento](#desenvolvimento)

---

## instalar

1. abra o After Effects e vá em *File › Scripts › Run Script File…*
2. escolha `INSTALAR PROMO GNEWS.jsx`, na pasta do PROMO GNEWS na rede (a que tem as pastas `cep` e `source`)
3. se tudo estiver ok, o instalador abre direto em **instalar** / **atualizar**. se faltar algo, ele mostra o quê — e deixa escolher a pasta, caso não encontre
4. reinicie o After Effects e abra *Window › Extensions › PROMO GNEWS*

> o código fica na rede: para atualizar, basta trocar os arquivos lá e reabrir o painel. o instalador só precisa rodar de novo quando a equipe avisar.\
> se algo parecer antigo, rode `tools/diagnostico.jsx` (*Run Script File…*): ele lista as cópias instaladas e aponta as desatualizadas.

---

## a barra

<img src="images/doc/gifs/sanfona.gif" width="230" align="right" alt="sanfona">

a barra é uma **sanfona**: cada seção é um ícone; ao abrir, as ferramentas da seção aparecem logo abaixo (ou ao lado, na barra horizontal).

- **vertical ou horizontal** — redimensione o painel: estreito mostra só ícones, largo mostra os nomes, baixo e largo vira uma barra horizontal (com 1 ou 2 linhas de ferramentas)
- **tooltips** — pare o mouse em cima de um botão para ver o nome
- **botão direito** — variações de algumas ferramentas (ex.: definir pasta, abrir tags, ajustar quantidade de frames)
- **tarefas longas** (organizar, coletar, batch) mostram o progresso no próprio botão, numa linha no rodapé e na porcentagem do indicador de seleção. clique de novo para cancelar
- **seleção** — o indicador no canto mostra quantos layers estão selecionados (verde = comp ativa). ferramentas que precisam de seleção ficam apagadas sem ela. a bolinha fica **vermelha** quando a rede está fora ou quando a barra antiga ainda está instalada (o motivo aparece no tooltip)

<br clear="right">

**logo** — passe o mouse sobre a logo: a animação oficial acompanha a posição do mouse, como o thumbnail do Premiere.

![logo](images/doc/gifs/logo.gif)

na horizontal, quando o painel é baixo e largo:

![barra horizontal](images/cep/panel-horizontal.png)

---

## seções e ferramentas

ícones ampliados e com o traço de destaque na cor de cada seção — na barra eles aparecem menores, em cinza, e ganham a cor ao passar o mouse.

### <img src="images/doc/icons/ctrl.png" width="32" alt="Controles"> Controles

| | ferramenta | o que faz | precisa de | botão direito |
| :---: | --- | --- | --- | --- |
| <img src="images/doc/icons/ctrl-null.png" width="32" alt="Null parent"> | **Null parent** | cria um null pai na posição de cada layer selecionado (sem seleção: no centro da comp). o tipo de null (solid ou shape) vem das preferências. | comp ativa |  |
| <img src="images/doc/icons/ctrl-nullc.png" width="32" alt="Null centralizado"> | **Null centralizado** | cria **um** null pai no centro geométrico de 2 ou mais layers selecionados. | 2+ layers |  |
| <img src="images/doc/icons/ctrl-parent.png" width="32" alt="Selecionar parent"> | **Selecionar parent** | sobe na hierarquia: seleciona o pai dos layers selecionados. | comp ativa |  |
| <img src="images/doc/icons/ctrl-child.png" width="32" alt="Selecionar children"> | **Selecionar children** | desce na hierarquia: seleciona todos os filhos dos layers selecionados. | comp ativa |  |
| <img src="images/doc/icons/ctrl-tg.keys.png" width="32" alt="Null: copiar animação"> | **Null: copiar animação** | modificador do **null**: leva os keyframes de transformação (anchor, posição, escala, rotação) para o null. |  |  |
| <img src="images/doc/icons/ctrl-tg.exp.png" width="32" alt="Null: copiar expressões"> | **Null: copiar expressões** | modificador do **null**: leva as expressões de transformação para o null. |  |  |

### <img src="images/doc/icons/anim.png" width="32" alt="Animação"> Animação

| | ferramenta | o que faz | precisa de | botão direito |
| :---: | --- | --- | --- | --- |
| <img src="images/doc/icons/anim-inf.png" width="32" alt="Influência dos keyframes"> | **Influência dos keyframes** | abre a janela de **curvas**: edita a influência dos keyframes e aplica por keyframes ou por expressão. |  |  |
| <img src="images/doc/icons/anim-lock.png" width="32" alt="Travar transformações"> | **Travar transformações** | tranca todas as propriedades de transformação **não animadas** dos layers selecionados. | layers |  |
| <img src="images/doc/icons/anim-rand.png" width="32" alt="Randomizar layers"> | **Randomizar layers** | desloca a entrada e a saída de cada layer selecionado em tempos aleatórios. | 2+ layers | ajusta frames |
| <img src="images/doc/icons/anim-seq.png" width="32" alt="Sequenciar layers"> | **Sequenciar layers** | sequencia os layers selecionados, um depois do outro. | 2+ layers | ajusta frames |
| <img src="images/doc/icons/anim-cols.png" width="32" alt="Guia de colunas"> | **Guia de colunas** | cria um guia de colunas na comp. | comp ativa |  |
| <img src="images/doc/icons/anim-arrow.png" width="32" alt="Seta"> | **Seta** | preset de seta com controles no *effect controls*. | comp ativa |  |
| <img src="images/doc/icons/anim-count.png" width="32" alt="Contador"> | **Contador** | rig de contagem num layer de texto (número, porcentagem, tempo…), com controles no *effect controls*. | comp ativa |  |
| <img src="images/doc/icons/anim-type.png" width="32" alt="Typewriter"> | **Typewriter** | lettering com animação de digitação. | comp ativa |  |
| <img src="images/doc/icons/anim-words.png" width="32" alt="Palavras"> | **Palavras** | lettering com animação palavra por palavra. | comp ativa |  |
| <img src="images/doc/icons/anim-box.png" width="32" alt="Tarja simples"> | **Tarja simples** | cria uma tarja simples. | comp ativa |  |
| <img src="images/doc/icons/anim-wig.png" width="32" alt="Wig"> | **Wig** | rig de *wiggle* na posição dos layers selecionados, com controles. | layers |  |
| <img src="images/doc/icons/anim-ik.png" width="32" alt="IK (3 layers)"> | **IK (3 layers)** | IK simples com 3 layers selecionados **em ordem** (ex.: coxa → canela → pé). | 3+ layers |  |

### <img src="images/doc/icons/fx.png" width="32" alt="Efeitos"> Efeitos

a camada de ajuste é fixa; os **efeitos e seus grupos são editáveis** nas preferências — escolha qualquer efeito instalado numa lista pesquisável e um ícone (ou 2 letras). botão direito num efeito abre as preferências já nele. padrão:

| | ferramenta | o que faz | precisa de | botão direito |
| :---: | --- | --- | --- | --- |
| <img src="images/doc/icons/fx-adj.png" width="32" alt="Adjustment layer"> | **Adjustment layer** | adjustment layer do tamanho da comp (solid ou shape, nas preferências). | comp ativa |  |
| <img src="images/doc/icons/fx-curves.png" width="32" alt="Curves"> | **Curves** | aplica *Curves* nos layers selecionados. | layers |  |
| <img src="images/doc/icons/fx-levels.png" width="32" alt="Levels"> | **Levels** | aplica *Levels*. | layers |  |
| <img src="images/doc/icons/fx-lumetri.png" width="32" alt="Lumetri Color"> | **Lumetri Color** | aplica *Lumetri Color*. | layers |  |
| <img src="images/doc/icons/fx-gauss.png" width="32" alt="Gaussian Blur"> | **Gaussian Blur** | aplica *Gaussian Blur*. | layers |  |
| <img src="images/doc/icons/fx-compound.png" width="32" alt="Compound Blur"> | **Compound Blur** | aplica *Compound Blur*. | layers |  |
| <img src="images/doc/icons/fx-lens.png" width="32" alt="Lens Blur"> | **Lens Blur** | aplica *Lens Blur*. | layers |  |
| <img src="images/doc/icons/fx-fill.png" width="32" alt="Fill"> | **Fill** | aplica *Fill*. | layers |  |
| <img src="images/doc/icons/fx-3d.png" width="32" alt="3D Glasses"> | **3D Glasses** | aplica *3D Glasses*. | layers |  |
| <img src="images/doc/icons/fx-fractal.png" width="32" alt="Fractal Noise"> | **Fractal Noise** | aplica *Fractal Noise*. | layers |  |
| <img src="images/doc/icons/fx-grain.png" width="32" alt="Add Grain"> | **Add Grain** | aplica *Add Grain*. | layers |  |

### <img src="images/doc/icons/txt.png" width="32" alt="Texto"> Texto

| | ferramenta | o que faz | precisa de | botão direito |
| :---: | --- | --- | --- | --- |
| <img src="images/doc/icons/txt-up.png" width="32" alt="Caixa alta"> | **Caixa alta** | converte os textos selecionados para CAIXA ALTA. | layers |  |
| <img src="images/doc/icons/txt-low.png" width="32" alt="Caixa baixa"> | **Caixa baixa** | converte para caixa baixa. | layers |  |
| <img src="images/doc/icons/txt-tit.png" width="32" alt="Title case"> | **Title case** | converte para Title Case. | layers |  |
| <img src="images/doc/icons/txt-clean.png" width="32" alt="Limpar espaços e quebras"> | **Limpar espaços e quebras** | remove espaços repetidos e quebras de linha e apara o texto. | layers |  |
| <img src="images/doc/icons/txt-split.png" width="32" alt="Separar colunas"> | **Separar colunas** | separa um texto em colunas: cada coluna vira um novo layer de texto. | layers |  |
| <img src="images/doc/icons/txt-brk.png" width="32" alt="Quebrar linhas"> | **Quebrar linhas** | quebra as linhas a partir de um limite de caracteres. | layers | ajusta caracteres |

### <img src="images/doc/icons/brand.png" width="32" alt="Marca"> Marca

| | ferramenta | o que faz | precisa de | botão direito |
| :---: | --- | --- | --- | --- |
| <img src="images/doc/icons/brand-pal.png" width="32" alt="Paleta em shape layer"> | **Paleta em shape layer** | shape layer com as amostras da paleta (guide layer, travado). | comp ativa |  |
| <img src="images/doc/icons/brand-onair.png" width="32" alt="Seta on-air"> | **Seta on-air** | shape layer com a seta do on-air. | comp ativa |  |
| <img src="images/doc/icons/brand-logo.png" width="32" alt="Logo estático"> | **Logo estático** | shape layer com a logo GNEWS estática. | comp ativa |  |
| <img src="images/doc/icons/brand-logoa.png" width="32" alt="Logo animado 3s"> | **Logo animado 3s** | shape layer com a logo GNEWS animada (3 s), a partir do tempo atual da comp. | comp ativa |  |

**paleta GNEWS** · aplica um *Fill* com a cor nos layers selecionados. os grupos e as cores são **editáveis** nas preferências (hex em texto, + cor, + grupo); os nomes são automáticos, em português. na barra larga cada cor aparece com nome e hex. botão direito numa cor abre a paleta nas preferências. padrão:

<img src="images/doc/icons/brand-cor-_E53131.png" width="32" alt="#E53131"> <img src="images/doc/icons/brand-cor-_EEFF8C.png" width="32" alt="#EEFF8C"> <img src="images/doc/icons/brand-cor-_231E1E.png" width="32" alt="#231E1E"> <img src="images/doc/icons/brand-cor-_141414.png" width="32" alt="#141414"> <img src="images/doc/icons/brand-cor-_333333.png" width="32" alt="#333333"> <img src="images/doc/icons/brand-cor-_4A4A4A.png" width="32" alt="#4A4A4A"> <img src="images/doc/icons/brand-cor-_B2B2B2.png" width="32" alt="#B2B2B2"> <img src="images/doc/icons/brand-cor-_F2F2F2.png" width="32" alt="#F2F2F2"> <img src="images/doc/icons/brand-cor-_F23333.png" width="32" alt="#F23333"> <img src="images/doc/icons/brand-cor-_FF4D4D.png" width="32" alt="#FF4D4D"> <img src="images/doc/icons/brand-cor-_FF674D.png" width="32" alt="#FF674D"> <img src="images/doc/icons/brand-cor-_FF8F4D.png" width="32" alt="#FF8F4D"> <img src="images/doc/icons/brand-cor-_FFC44E.png" width="32" alt="#FFC44E"> <img src="images/doc/icons/brand-cor-_FF5A67.png" width="32" alt="#FF5A67"> <img src="images/doc/icons/brand-cor-_FF739A.png" width="32" alt="#FF739A"> <img src="images/doc/icons/brand-cor-_FF8CCD.png" width="32" alt="#FF8CCD"> <img src="images/doc/icons/brand-cor-_B5ADFF.png" width="32" alt="#B5ADFF"> <img src="images/doc/icons/brand-cor-_80C0FF.png" width="32" alt="#80C0FF"> <img src="images/doc/icons/brand-cor-_5CE6A1.png" width="32" alt="#5CE6A1">

<sub>`#E53131` `#EEFF8C` `#231E1E` `#141414` `#333333` `#4A4A4A` `#B2B2B2` `#F2F2F2` `#F23333` `#FF4D4D` `#FF674D` `#FF8F4D` `#FFC44E` `#FF5A67` `#FF739A` `#FF8CCD` `#B5ADFF` `#80C0FF` `#5CE6A1`</sub>

### <img src="images/doc/icons/proj.png" width="32" alt="Projeto"> Projeto

| | ferramenta | o que faz | precisa de | botão direito |
| :---: | --- | --- | --- | --- |
| <img src="images/doc/icons/proj-id.png" width="32" alt="Inserir usuário e ID nas comps"> | **Inserir usuário e ID nas comps** | insere usuário, tag PROMO e ID do projeto no nome das comps selecionadas. |  |  |
| <img src="images/doc/icons/proj-rename.png" width="32" alt="Renomear comps"> | **Renomear comps** | renomeia comps de templates e assinaturas no padrão de nomenclatura de promo. |  |  |
| <img src="images/doc/icons/proj-org.png" width="32" alt="Organizar projeto"> | **Organizar projeto** | cria e organiza as pastas do projeto pelo modelo das preferências (tarefa longa, com progresso). |  | tags de organização |
| <img src="images/doc/icons/proj-endp.png" width="32" alt="Presets de end page"> | **Presets de end page** | abre a janela de **end page**: presets, layout e textos da assinatura. |  |  |
| <img src="images/doc/icons/proj-save.png" width="32" alt="Salvar projeto"> | **Salvar projeto** | salva o projeto no padrão de nomenclatura (ID + retranca). |  | salvar em outra pasta |
| <img src="images/doc/icons/proj-collect.png" width="32" alt="Coletar arquivos"> | **Coletar arquivos** | coleta os arquivos usados no projeto. |  |  |
| <img src="images/doc/icons/proj-cfonts.png" width="32" alt="Coletar fontes"> | **Coletar fontes** | coleta as fontes usadas no projeto. |  |  |
| <img src="images/doc/icons/proj-open.png" width="32" alt="Abrir pasta do projeto"> | **Abrir pasta do projeto** | abre a pasta do projeto. |  |  |

### <img src="images/doc/icons/app.png" width="32" alt="Programa"> Programa

| | ferramenta | o que faz | precisa de | botão direito |
| :---: | --- | --- | --- | --- |
| <img src="images/doc/icons/app-fonts.png" width="32" alt="Fontes"> | **Fontes** | abre a janela de **fontes**: baixa e instala as fontes do on-air. |  |  |
| <img src="images/doc/icons/app-ame.png" width="32" alt="Presets do Media Encoder"> | **Presets do Media Encoder** | instala os presets de exportação no Media Encoder. |  | abrir pasta de presets |
| <img src="images/doc/icons/app-psetup.png" width="32" alt="Setup do projeto"> | **Setup do projeto** | setup do projeto (preferências de projeto padrão de promo). |  |  |
| <img src="images/doc/icons/app-labels.png" width="32" alt="Cores de label"> | **Cores de label** | abre a janela de **labels**: cores e nomes dos 16 labels. |  | aplicar o padrão PROMO direto |
| <img src="images/doc/icons/app-csetup.png" width="32" alt="Setup da comp"> | **Setup da comp** | setup da comp ativa no padrão de promo. | comp ativa | vertical |
| <img src="images/doc/icons/app-batch.png" width="32" alt="Batch nunca desliga"> | **Batch nunca desliga** | batch das vinhetas *nunca desliga* (tarefa longa, com progresso). |  |  |

### <img src="images/doc/icons/dev.png" width="32" alt="Dev"> Dev

| | ferramenta | o que faz | precisa de | botão direito |
| :---: | --- | --- | --- | --- |
| <img src="images/doc/icons/dev-dev.dark.png" width="32" alt="Ícones .png → tema escuro"> | **Ícones .png → tema escuro** | converte ícones .png para o tema escuro. |  |  |
| <img src="images/doc/icons/dev-dev.zipTpl.png" width="32" alt="Zipar templates"> | **Zipar templates** | zipa a pasta de templates. |  |  |
| <img src="images/doc/icons/dev-dev.zipFonts.png" width="32" alt="Zipar fontes"> | **Zipar fontes** | zipa a pasta de fontes. |  |  |

### <img src="images/doc/icons/links.png" width="32" alt="Atalhos"> Atalhos

sites e pastas de uso diário — **editáveis** nas preferências (ícone ou 2 letras, nome, endereço / pasta, ordem). botão direito em um atalho abre as preferências já nele.

| | padrão | abre |
| :---: | --- | --- |
| <img src="images/doc/icons/link-od.png" width="32"> <img src="images/doc/icons/link-tr.png" width="32"> <img src="images/doc/icons/link-ap.png" width="32"> <img src="images/doc/icons/link-pl.png" width="32"> | **sites** | OneDrive, Trello promo, Apontamento, Planner |
| <img src="images/doc/icons/link-up.png" width="32"> <img src="images/doc/icons/link-slide.png" width="32"> | **PAM** | para arte · magazine (pastas definidas nas preferências) |
| <img src="images/doc/icons/link-bolt.png" width="32"> <img src="images/doc/icons/link-star.png" width="32"> <img src="images/doc/icons/link-bars.png" width="32"> | **rede** | PAM hard news · T: utilidades · peças gráficas — indisponíveis no modo home office |
| <img src="images/doc/icons/link-dot.png" width="32"> | **diários · hoje** | a pasta do dia, calculada automaticamente |

### rodapé

| | | |
| :---: | --- | --- |
| <img src="images/doc/icons/foot-0.png" width="32" alt="templates"> | **templates** | janela de templates |
| <img src="images/doc/icons/foot-1.png" width="32" alt="busca"> | **buscar texto** | janela de busca nos layers de texto |
| <img src="images/doc/icons/foot-2.png" width="32" alt="preview"> | **preview .png** | salva o frame atual da comp em .png · botão direito: junto ao projeto |
| <img src="images/doc/icons/foot-3.png" width="32" alt="preferências"> | **preferências** | janela de preferências |

---

## janelas

| curvas | busca | templates | fontes |
| :---: | :---: | :---: | :---: |
| <img src="images/cep/curves.png" width="200"> | <img src="images/cep/search.png" width="200"> | <img src="images/cep/templates.png" width="200"> | <img src="images/cep/fonts.png" width="200"> |
| influência dos keyframes; aplica por **keyframes** ou por **expressão** (a mesma curva) | busca no conteúdo dos layers de texto (sem comp selecionada: em todas) | baixa, lista e importa os templates de PROMO, com filtro | famílias em grupos com o preview de cada estilo; baixa e instala as fontes do on-air |

| tags | end page | labels | preferências |
| :---: | :---: | :---: | :---: |
| <img src="images/cep/tags.png" width="200"> | <img src="images/cep/endpage.png" width="200"> | <img src="images/cep/labels.png" width="200"> | <img src="images/cep/settings.png" width="200"> |
| tags de organização nos itens do projeto | presets, layout e textos da assinatura | as 16 cores de label, com nome automático e presets próprios | usuário, layers, projeto, pastas, **atalhos** e painel |

**labels** — trocar de cor em cascata, escolher matiz/saturação no quadrado e o brilho no slider:

![labels](images/doc/gifs/labels.gif)

**listas** — todo menu das janelas estica para baixo e é pesquisável (digite para filtrar, ↑ ↓ Enter):

![dropdown](images/doc/gifs/dropdown.gif)

**fontes** — cada família (pasta) abre os seus estilos, cada um no próprio arquivo; edite o texto de preview no campo ou direto numa amostra (× limpa), tamanho P / M / G:

![fontes](images/doc/gifs/fontes.gif)

**preferências** — o que a barra mostra é editável:

| atalhos | paleta | efeitos |
| :---: | :---: | :---: |
| <img src="images/doc/gifs/atalhos.gif" width="260" alt="atalhos"> | <img src="images/doc/gifs/paleta.gif" width="260" alt="paleta"> | <img src="images/doc/gifs/efeitos.gif" width="260" alt="efeitos"> |
| ícone ou letras, nome, destino, arraste para reordenar | grupos de cores em hex, + cor, nomes automáticos | qualquer efeito instalado, numa lista pesquisável |

---

## desenvolvimento

estrutura do código, instalação de desenvolvimento (macOS / Windows), build e cuidados com o ExtendScript em [cep/README.md](cep/README.md).

<sub>imagens desta página: `node tools/doc-icons.js` (ícones) · `node tools/doc-gifs.js` (gifs) — geradas a partir da própria interface.</sub>
