# Pauta — loja demo do nicho de papelaria e escritório

Cópia do starter [`ecomplus/store`](https://github.com/ecomplus/store)
tematizada para **papelaria e material de escritório**, atendendo empresa e
consumidor final.

> **Este nicho ainda não existe no site institucional.** Não há marca em
> `src/config/brands.ts` nem página em `/segmentos/`. O posicionamento foi
> **proposto**, não portado. Nome, logo e domínio são placeholders.

## A tese do tema: o eixo é RECOMPRA, não descoberta

Papelaria de escritório não é compra de descoberta. O mesmo comprador pede
quase a mesma lista todo mês, e a navegação por vitrine é atrito puro para
ele — são doze cliques para repetir um pedido que ele já sabe de cor.

### Como isso a separa da Bitola

As duas são B2B, e por isso o risco de ficarem parecidas é real — foi
exatamente o que aconteceu entre Bitola e Circuito. O que as separa é o **eixo
do problema**:

| | Bitola | Pauta |
|---|---|---|
| Pergunta do cliente | *que peça serve?* | *como repito o pedido?* |
| Resolve | especificação | repetição |
| Elemento central | busca no header | caixa de texto na home |
| Card | ficha técnica | código + quantidade |

## O que é diferente aqui

| Peça | O que muda |
|---|---|
| `sections/PedidoRapidoSection.astro` | Cola a lista de códigos e pronto — troca a navegação inteira por um `textarea`. |
| `components/ProductCard.vue` | **Código selecionável de um clique** (`select-all`), que alimenta o pedido rápido. |
| `components/ProductCard.vue` | Seletor de quantidade **no card**, não na ficha. |
| `components/ProductCard.vue` | Linha de **preço por volume**. |
| `assets/style.css` | `.ui-grifo` — marca-texto real, com `box-decoration-break: clone`. |

### O parser do pedido rápido

Aceita `CODIGO, QTD`, `CODIGO;QTD`, `CODIGO QTD` e `CODIGO` sozinho. A
quantidade é sempre o **último** número da linha — código de papelaria costuma
ter dígito no meio (`PAP-A4-75G`), e pegar o primeiro transformaria "A4" em
quantidade 4.

### O amarelo é grifo, nunca preenchimento

`.ui-grifo` desenha um traço que **para em 0.62em**, para sentar na base da
letra e deixar a ascendente livre — grifo real não cobre a palavra inteira. O
`box-decoration-break: clone` é o que faz o traço acompanhar a quebra de linha;
sem ele um grifo de duas linhas vira um retângulo atravessando o parágrafo.

Se o amarelo virar fundo de bloco, a marca perde a referência ao marca-texto.

## ⚠️ O que é estático

| O quê | Onde | Como ligar |
|---|---|---|
| "a partir de 12 un. o preço cai" | `ProductCard.vue` | Preço por quantidade (kit/atacado) cadastrado |
| Resultado do pedido rápido | `PedidoRapidoSection.astro` | Ver abaixo |

**O pedido rápido não adiciona ao carrinho.** O parser é real e roda no
cliente, mas o que ele faz ao final é montar uma busca. Duas razões: numa demo
em build estático o carrinho não fecha, e resolver código → produto exigiria um
GET por linha na API (numa loja de verdade, um endpoint de lote).

Ligar de verdade = trocar o `window.location` do final por uma chamada a
`/api/products?sku=…` e um `addToCart` por item resolvido.

A própria seção diz isso ao visitante. **Manter.**

## Pendências conhecidas

- **`/p/pedido-rapido` e `/p/preco-por-volume` não existem.** As duas são
  linkadas no pitch bar. Criar as extra-pages antes de publicar — mesmo
  defeito que a Raia teve na primeira rodada.

## Rodar

```bash
npm i
npm run dev                                   # http://localhost:3000
BUILD_OUTPUT=static npx cloudcommerce build --codebase ssr
```

## Armadilhas herdadas do conjunto

- `/s/<termo>` **não funciona no build estático** — usar `/s?q=<termo>`.
- **Input dentro de `<a>` navega ao clicar** — por isso o seletor de
  quantidade e o código com `select-all` ficam fora do `ALink`, e a moldura do
  card passou para a div que envolve os dois.
- Ícone que não casa **some em silêncio** no UnoCSS. Na dúvida, forma
  prefixada: `i-lucide-<nome>`.
- `cloudcommerce build` **regenera o `firebase.json`** — buildar primeiro,
  escrever a config depois.
