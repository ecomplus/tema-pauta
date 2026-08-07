<!--
  Card de produto — variante Pauta (papelaria e material de escritório).

  ── O CARD DE RECOMPRA ───────────────────────────────────────────────────
  O eixo do tema é repetir um pedido, não descobrir um produto. Isso muda duas
  coisas no card em relação a todas as outras variantes:

  1. O CÓDIGO aparece, selecionável de um clique (`.ui-codigo` tem `select-all`).
     É o dado que o comprador copia para a lista do `PedidoRapidoSection` — sem
     ele o pedido rápido não tem de onde sair.

  2. O seletor de QUANTIDADE fica no card, não na ficha. Papelaria se compra
     em caixa com 50, resma com 500, pacote com 12 — abrir a ficha para trocar
     de 1 para 10 é atrito puro num pedido de vinte itens.

  E a linha de PREÇO POR VOLUME, que é o argumento comercial do nicho: o valor
  cai a partir de uma quantidade, e mostrar isso no card é o que faz o
  comprador aumentar o pedido sozinho.

  ATENÇÃO: a faixa de volume é ESTÁTICA. Ligar de verdade depende de preço por
  quantidade cadastrado (kit/atacado). Consta no README.

  Input dentro de `<a>` navega ao clicar — por isso a linha de compra fica FORA
  do `ALink` e a moldura passou para a div que envolve os dois. Mesma armadilha
  que já custou tempo na Bitola e na Circuito.
-->
<template>
  <article
    ref="card"
    :data-sku="product.sku"
    class="group relative mx-auto h-full max-w-[320px] py-1.5"
  >
    <div
      class="flex h-full flex-col rounded border border-base-200 bg-white p-3
      transition hover:border-primary"
    >
      <ALink :href="link" class="flex grow flex-col no-underline">
        <div class="relative overflow-hidden rounded-sm bg-base-50">
          <AImg
            v-if="images?.length"
            :picture="images[0]"
            :alt="title"
            class="block aspect-square w-full object-contain"
          />
          <div v-else class="aspect-square w-full bg-base-100" />
          <span
            v-if="discountPercentage"
            class=":uno: absolute left-0 top-0 z-20 bg-primary px-2 py-0.5
            text-[0.6875rem] font-bold text-white"
          >
            -{{ discountPercentage }}%
          </span>
        </div>

        <component
          :is="headingTag"
          class="mt-2.5 line-clamp-2 text-sm font-semibold leading-snug"
          :class="isActive ? 'text-base-900' : 'text-base-500'"
        >
          {{ title }}
        </component>
      </ALink>

      <!-- Fora do `ALink`: `select-all` dentro de um link seleciona e navega. -->
      <p class="mt-1">
        <span class="ui-codigo">{{ product.sku }}</span>
      </p>

      <div class="mt-auto pt-2">
        <div v-if="isActive" class="[&_*]:font-bold [&_.text-xl]:text-xl">
          <Prices :product="product" />
        </div>
        <p v-if="isActive" class="mt-0.5 text-[0.6875rem] leading-tight text-base-600">
          <span class="font-semibold ui-grifo">a partir de 12 un.</span>
          o preço cai
        </p>
        <span v-else class="bg-warning-100 text-warning-700 ui-badge">
          {{ !isInStock ? $t.i19outOfStock : $t.i19inactive }}
        </span>
      </div>

      <div v-if="isActive && !hasVariations" class="pt-2.5">
        <div v-if="isFailedToCart" class="text-sm text-warning-800">
          {{ $t.i19someItemIsUnavailable }}
        </div>
        <div v-else class="flex items-center gap-2">
          <QuantitySelector v-model="quantityToAdd" />
          <button
            class=":uno: w-full ui-btn-sm ui-btn-primary"
            @click.stop.prevent="loadToCart(quantityToAdd)"
          >
            {{ $t.i19addToCart }}
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  type Props as UseProductCardProps,
  useProductCard,
} from '@@sf/composables/use-product-card';
import Prices from '~/components/Prices.vue';
import QuantitySelector from '~/components/QuantitySelector.vue';

export type Props = UseProductCardProps & {
  headingTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}
const props = withDefaults(defineProps<Props>(), {
  headingTag: 'h3',
});
const {
  product,
  title,
  link,
  images,
  isInStock,
  isActive,
  discountPercentage,
  hasVariations,
  loadToCart,
  isFailedToCart,
} = useProductCard(props as UseProductCardProps);
const card = ref<HTMLElement | null>(null);
const quantityToAdd = ref(1);
</script>
