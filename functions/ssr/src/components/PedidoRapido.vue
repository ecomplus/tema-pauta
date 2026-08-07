<!--
  PEDIDO RÁPIDO — a peça que justifica esta variante existir.

  Papelaria de escritório não é compra de descoberta: é reposição. O mesmo
  comprador pede quase a mesma lista todo mês, e navegar o catálogo item por
  item é atrito puro — vinte itens viram mais de cem cliques.

  ── POR QUE ISTO É UM COMPONENTE VUE E NÃO UM SCRIPT NO ASTRO ────────────
  A primeira versão era um `<script>` solto na seção: ele lia a lista, contava
  e mandava tudo para `/s?q=<códigos>`. O parser funcionava, mas o RESULTADO
  não: a busca da loja ignora termo que não casa, então colar quatro códigos
  precisos devolvia 81 produtos sem relação nenhuma. A promessa era conferir
  um pedido e a entrega era o catálogo inteiro — corretamente relatado como
  "não funcionou muito bem".

  Agora a conferência é real: cada código é resolvido contra a API (leitura é
  pública, não precisa de credencial), o que existe vira linha com nome, preço
  e subtotal, o que não existe é listado como não encontrado, e o botão
  adiciona TUDO ao carrinho de uma vez.

  Isto funciona de verdade nas demos — o carrinho abre e soma. Só o checkout
  não fecha, que é consequência do build estático e vale para as quinze lojas.
-->
<template>
  <form @submit.prevent="conferir">
    <label for="PedidoRapido" class="mb-1.5 block text-xs font-semibold
      uppercase tracking-wide text-base-600">
      Cole sua lista
    </label>
    <textarea
      id="PedidoRapido"
      v-model="texto"
      rows="7"
      spellcheck="false"
      :placeholder="exemplo"
      class="w-full rounded border border-base-300 bg-white px-3 py-2.5
      font-mono text-sm leading-relaxed text-base-900
      placeholder:text-base-400 focus:border-primary focus:outline-none"
    ></textarea>

    <output class="mt-2 block min-h-5 text-xs text-base-600">
      {{ resumo }}
    </output>

    <button
      type="submit"
      class=":uno: mt-3 w-full ui-btn ui-btn-primary"
      :disabled="carregando || !itens.length"
      :class="(carregando || !itens.length) ? 'cursor-not-allowed opacity-60' : null"
    >
      {{ carregando ? 'Conferindo…' : 'Conferir os itens' }}
    </button>

    <!-- Conferência: o passo que faltava. -->
    <div v-if="conferidos.length || naoEncontrados.length" class="mt-4">
      <table v-if="conferidos.length" class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-base-200">
            <th class="py-1.5 text-left text-xs font-semibold uppercase
              tracking-wide text-base-500">Item</th>
            <th class="py-1.5 text-right text-xs font-semibold uppercase
              tracking-wide text-base-500">Qtd</th>
            <th class="py-1.5 text-right text-xs font-semibold uppercase
              tracking-wide text-base-500">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in conferidos" :key="item.codigo" class="border-b border-base-100">
            <td class="py-2 pr-2">
              <span class="block leading-snug text-base-900">{{ item.nome }}</span>
              <span class="ui-codigo">{{ item.codigo }}</span>
            </td>
            <td class="py-2 text-right tabular-nums text-base-700">{{ item.quantidade }}</td>
            <td class="py-2 text-right font-semibold tabular-nums text-base-900">
              {{ $money(item.preco * item.quantidade) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" class="pt-2.5 text-xs font-semibold uppercase
              tracking-wide text-base-600">Total</td>
            <td class="pt-2.5 text-right text-lg font-bold tabular-nums text-base-900">
              {{ $money(total) }}
            </td>
          </tr>
        </tfoot>
      </table>

      <p v-if="naoEncontrados.length" class="mt-3 text-sm ui-alert">
        <strong>Não encontramos {{ naoEncontrados.length }}
          {{ naoEncontrados.length === 1 ? 'código' : 'códigos' }}:</strong>
        <span class="ml-1 ui-codigo">{{ naoEncontrados.join(', ') }}</span>
        <br />
        O código precisa vir <strong>igual ao do anúncio, inclusive maiúsculas e
        minúsculas</strong> — um clique no código do card seleciona ele inteiro.
        Se estiver certo e mesmo assim não achar,
        <a href="/p/contato" class="ui-link">fale com a gente</a>: quase sempre
        há substituto equivalente.
      </p>

      <button
        v-if="conferidos.length"
        type="button"
        class=":uno: mt-3 w-full ui-btn ui-btn-primary"
        @click="adicionarTudo"
      >
        Adicionar {{ totalUnidades }}
        {{ totalUnidades === 1 ? 'unidade' : 'unidades' }} ao carrinho
      </button>
      <p v-if="adicionado" class="mt-2 text-center text-xs font-semibold text-primary">
        Itens no carrinho. Abra o carrinho no topo para conferir.
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { addProductToCart } from '@@sf/state/shopping-cart';

type Item = { codigo: string; quantidade: number };
type Conferido = Item & { _id: string; nome: string; preco: number };

const props = defineProps<{ apiBase: string }>();

const exemplo = 'PAP-A4-75G, 10\nCAN-ESF-AZUL 50\nPAS-AZ-OF; 6';

const texto = ref('');
const carregando = ref(false);
const conferidos = ref<Conferido[]>([]);
const naoEncontrados = ref<string[]>([]);
const adicionado = ref(false);

/*
  Parser das linhas coladas. Aceita `CODIGO, QTD`, `CODIGO;QTD`, `CODIGO QTD` e
  `CODIGO` sozinho.

  A quantidade é sempre o ÚLTIMO número da linha, e isso é deliberado: código
  de papelaria costuma ter dígito no meio (`PAP-A4-75G`), e pegar o primeiro
  número transformaria o "A4" em quantidade 4.
*/
const parseLinha = (linha: string): Item | null => {
  const limpa = linha.trim();
  if (!limpa) return null;
  const m = limpa.match(/^(.*?)[\s,;\t]+(\d+)$/);
  if (m) return { codigo: m[1].trim(), quantidade: Number(m[2]) || 1 };
  return { codigo: limpa.replace(/[,;]+$/, ''), quantidade: 1 };
};

const itens = computed<Item[]>(() => texto.value
  .split(/\r?\n/)
  .map(parseLinha)
  .filter((i): i is Item => i !== null && i.codigo.length > 0));

const resumo = computed(() => {
  if (!itens.value.length) return '';
  const total = itens.value.reduce((soma, i) => soma + i.quantidade, 0);
  const plural = itens.value.length === 1 ? 'código' : 'códigos';
  return `${itens.value.length} ${plural}, ${total} un. no total`;
});

const total = computed(() => conferidos.value
  .reduce((soma, i) => soma + i.preco * i.quantidade, 0));
const totalUnidades = computed(() => conferidos.value
  .reduce((soma, i) => soma + i.quantidade, 0));

/*
  Uma requisição por código, em paralelo. Numa loja com pedido de cem linhas o
  certo é um endpoint de lote; aqui a lista é de dezenas e o paralelo resolve
  sem inventar infraestrutura que não existe.

  `fetch` direto no endpoint público, e não o cliente `@cloudcommerce/api`:
  leitura de catálogo não precisa de credencial, e é exatamente a chamada que o
  `seed.mjs` do demo-catalog já usa para achar produto por SKU.

  ── A BUSCA POR SKU É SENSÍVEL A CAIXA ───────────────────────────────────
  `nb-apl-154` acha; `NB-APL-154` devolve zero. Numa lista colada de planilha a
  caixa vem como veio, então tentar só o que foi digitado produz falso negativo.
  Daí as três tentativas: como veio, minúsculo, maiúsculo. Só a primeira roda no
  caso comum — as outras duas só quando a anterior não achou nada.

  Isso NÃO cobre caixa mista (`nb-apl-1203-C773` existe assim na loja 1011), e
  não dá para cobrir tentando variantes: seriam 2^n combinações. O caminho
  correto seria um filtro case-insensitive na API ou um índice próprio; nenhum
  dos dois existe hoje. Por isso a mensagem de "não encontrado" diz explicitamente
  que a caixa importa, em vez de deixar o cliente adivinhando — e o código no
  card é `select-all`, então copiar traz a caixa certa.

  `.catch` por item para que um código problemático não derrube a conferência
  inteira: o resultado dele vira "não encontrado", que é a informação útil.
*/
const buscarUm = async (codigo: string) => {
  const url = `${props.apiBase}/products?sku=${encodeURIComponent(codigo)}`
    + '&fields=_id,sku,name,price&limit=1';
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  return j?.result?.[0] || null;
};

const buscar = async (item: Item): Promise<Conferido | null> => {
  const tentativas = [...new Set([
    item.codigo,
    item.codigo.toLowerCase(),
    item.codigo.toUpperCase(),
  ])];
  try {
    for (const codigo of tentativas) {
      // eslint-disable-next-line no-await-in-loop
      const p = await buscarUm(codigo);
      if (p?._id) {
        return {
          ...item,
          _id: p._id,
          nome: p.name || item.codigo,
          preco: typeof p.price === 'number' ? p.price : 0,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
};

const conferir = async () => {
  if (!itens.value.length || carregando.value) return;
  carregando.value = true;
  adicionado.value = false;
  conferidos.value = [];
  naoEncontrados.value = [];
  const lista = itens.value;
  const achados = await Promise.all(lista.map(buscar));
  achados.forEach((achado, i) => {
    if (achado) conferidos.value.push(achado);
    else naoEncontrados.value.push(lista[i].codigo);
  });
  carregando.value = false;
};

const adicionarTudo = () => {
  conferidos.value.forEach((item) => {
    addProductToCart({ _id: item._id } as any, undefined, item.quantidade);
  });
  adicionado.value = true;
};
</script>
