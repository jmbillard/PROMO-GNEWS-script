# 🎬 template de end page

**existem 2 templates**
- *padrão* - 16:9 para exibição
- *vertical* - 9:16 para redes sociais

todos os controles, parâmetros e recursos são idênticos entre os 2.
a animação padrão tem 7 segundos, sendo 5 geralmente o suficiente.

> 📋 *exemplo:*\
>![exemplos_endPage](end%20page%20assets/comp_exemplos.gif)

---
<br/>

##  📌 funcionamento básico
  1. importe o template **end page.aet** para o projeto aberto.
  2. abra a **'comp_end page'** dentro da pasta *'---- render ----/end pages'*.
  3. arraste o *footage* (imagem de fundo) para dentro da comp, ele deverá ser sempre o último *layer*.
  4. altere o **título** e **subtítulo**, caso precise.
  5. abra a **'comp_img apresentador'** dentro da pasta *'---- edit ----'* e altere a visibilidade da imagem do apresentador, caso precise.
  6. abra a **'comp_pattern'** dentro da pasta *'---- edit ----'* e altere a visibilidade do pattern, caso precise.
  7. abra novamente a **'comp_end page'** dentro da pasta *'---- render ----/end pages'* e selecione o *layer* **'ctrl_comp'**.
  8. use a janela de controle de efeitos para alterar os demais parâmetros do template como, esconder subtítulo, alterar data e hora, etc...

> 📋 *exemplo:*\
>![projeto](end%20page%20assets/projeto.png)
>![comp_endPage](end%20page%20assets/comp_end%20page.png)

---
<br/>

## 🚨 **Atenção!**

- cada programa possui cores, patterns e fotos de apresentador específicas.

> 📋 *exemplos:*\
> ![ex_preview](end%20page%20assets/comp_preview.png)

- para agilizar a troca / cópia de informações e evitar erros, existe um sistema de presets de *end page* no script **PROMO GNEWS**.

> 📋 *exemplo:*\
>![presets](end%20page%20assets/presets.png)

---
<br/>


# 📣 parâmetros
todos os controles estão concentrados no *layer* **'ctrl_comp'**, são eles:
- *'layout end page'* → exibição e formatação do conteúdo
- *'servico end page'* → edição e formatação do serviço
- *'aparencia end page'* → temas e cores

## 🎮 layout end page
![layout](end%20page%20assets/layout.png)
- **modelo**:
  - programa → exibe o pattern e foto do apresentador
  - jornal → exibe o footage no fundo 
  - livre → possibilita misturar pattern e footage no fundo

- **logo** → exibe a marca GloboNews.
- **titulo** → exibe o título.
- **subtitulo** → exibe o subtítulo.
- **auto title case** → converte a caixa do texto do título para *'Title Case'*.

- **apoio**:
  - --------- → sem texto.
  - \- texto livre - → habilita a edição livre do apoio.
  - ESTREIA
  - NOVA TEMPORADA
  - EXCEPCIONALMENTE

- **foto** → exibe a foto selecionada na **'comp_img apresentador'**.
> a foto não será exibida no modelo *'jornal'*.
- **footage** → exibe a imagem de fundo.
> o footage não será exibido no modelo *'programa'*.
- **pattern** → exibe o pattern selecionado na **'comp_pattern'**.
> o pattern não será exibido no modelo *'jornal'*.

---
<br/>

## 🎮 servico end page
![servico](end%20page%20assets/servico.png)
- **formato**:
  - [*dia*] [*mes*] - [*hora*] [*min*] → *'10 DE SETEMBRO — 23h'*
  - DIA [*dia*] - [*hora*] [*min*] → *'DIA 10 — 23h'*
  - [*semana*] - [*hora*] [*min*] → *'SEGUNDA — 23h'*
  - MAIS TARDE - [*hora*] [*min*] → *'MAIS TARDE — 00h'*
  - TODA [*semana*] - [*hora*] [*min*] → *'TODA SEGUNDA — 23h'*
  - EM [*mes*] → *'EM SETEMBRO'*
  - \- formato livre - → habilita a edição livre do serviço.

- **[*semana*]**:
  - 'DOMINGO'
  - 'SEGUNDA'
  - 'TERÇA'
  - 'QUARTA'
  - 'QUINTA'
  - 'SEXTA'
  - 'SÁBADO'
  - 'HOJE'
> a combinação do formato 'TODA [*semana*]' com 'HOJE' resulta em *'DE SEGUNDA A SEXTA'*

- **[*dia*]** → altera o dia (valor entre 1 e 31).
- **[*mes*]**:
  - 'JANEIRO'
  - 'FEVEREIRO'
  - 'MAIO'
  - 'ABRIL'
  - 'MARÇO'
  - 'JUNHO'
  - 'JULHO'
  - 'AGOSTO'
  - 'SETEMBRO'
  - 'OUTUBRO'
  - 'NOVEMBRO'
  - 'DEZEMBRO'

- **a partir das** → substitui a data pelo texto 'A PARTIR DAS'.

- **[*hora*]** → altera a hora (valor entre 0 e 23).
- **[*min*]** → altera os minutos (valor entre 0 e 59).

> o horário sempre deve seguir o formato **24h**.

---
<br/>

## 🎮 aparencia end page
![aparencia](end%20page%20assets/aparencia.png)
- **tema**:
  - claro → fundo branco, marca vermelho, pattern cinza, texto preto e footage vermelho
  - cinza → fundo cinza, marca branco, pattern branco, texto preto e footage vermelho
  - escuro → fundo cinza escuro, marca vermelho, pattern amarelo, texto branco e footage pb
  - vermelho → fundo vermelho, marca preto, pattern preto, texto branco e footage pb
  - \- cores livres - → qualquer cor pode ser usada em cada elemento individualmente

- **cores** → edita a cor de todos os elementos no tema *'\- cores livres -'*

