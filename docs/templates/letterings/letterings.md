# 🎬 templates de lettering

**existem 3 variações (projetos diferentes)**
- *digitação* - anima as letras sequencialmente
- *palavras* - anima as palavras sequencialmente
- *footage animado* - anima as letras sequencialmente e desloca o footage para um quadrado.

> 📋 *exemplo:*\
> ![ex_preview](letterings%20assets/comp_exemplos.gif)

---
<br/>

##  📌 funcionamento básico
  1. importe o template **lettering *(nome do template desejado)*.aet** para o projeto aberto.
  2. abra a **'comp'** com o lettering animado.
  3. selecione o *text layer* **'txt_lettering 1'**.
  4. use a janela de controle de efeitos para alterar os parâmetros do template como, cor do texto, habilitar a base, etc...

---
<br/>

## 🚨 **Atenção!**

- para agilizar a produção do dia a dia existem 2 *'animation presets'* para texto no script **PROMO GNEWS**, text.\
o script criará um *text layer* automaticamente caso não exista algum já selecionado e aplica o *'animation preset'* desejado *(digitação e palavras)*.

  1. abra a aba de animação.
  2. clique no botão **'rigs and tools'**.
  3. selecione todos os *text layers* (se quiser).
  4. **sempre confira as comps geradas!**

> 📋 *exemplo:*\
>![batch](letterings%20assets/comp_exemplos.gif)

---
<br/>


# 📣 parâmetros
todos os controles estão concentrados no *text layer* **'txt_lettering 1'**, são eles:
- *'marca gnews'* → exibição e cores

## 🎮 palavras - words
![layout](letterings%20assets/words.png)
- **color scheme**:
  - white - red → texto branca e base vermelha
  - yellow - dark gray → texto amarelo e base cinza escuro
  - black - yellow → texto preto e base amarela

- **base - visibility** → exibe a base.
- **base - border size** → tamanho da borda.
- **border sides**:
  - base - border top → escala da borda superior.
  - base - border bottom → escala da borda inferior.

- **options**:
  - custom colors → habilita cores personalizadas no texto e base.
  - text - custom color → cor personalizada do texto.
  - base - custom color → cor personalizada da base.
  - animation direction:
    - up → de baixo para cima.
    - down → de cima para baixo.
    - left → da direita para esquerda.
    - right → da esquerda para direita.

  - distance → distância inicial da animação.
  - text - manual animation → controla o andamento.
  - mode:
    - auto in → anima a entrada usando o início do layer.
    - auto in / out → anima a entrada e saída usando o início e final do layer.
    - manual → a animação será controlada por keyframes no 'text - manual animation'.
  - speed → velocidade da animação automática.

