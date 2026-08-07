<!--
  Seletor de quantidade do card de produto.

  Aqui ele importa mais que nas outras variantes: papelaria se compra em caixa,
  resma e pacote, e obrigar a abrir a ficha para trocar de 1 para 10 é atrito
  puro num pedido de vinte itens. Ver o cabeçalho de `ProductCard.vue`.

  Envolve o componente do pacote para (a) dar ícone aos controles, que vêm sem
  conteúdo por padrão, (b) encolher o input — o tamanho original é de ficha de
  produto (h-12 w-14) e estoura a largura de um card de prateleira — e (c)
  centralizar o ícone.

  O (c) precisa de duas correções, e as duas vêm do pacote: o botão tem
  `leading-12`, uma caixa de linha de 3rem dentro de um botão de 2.25rem, e o
  preset de ícones aplica `margin-bottom: 0.22rem` em todo `i` para alinhar com
  texto. Somados, empurravam o traço do "−" e do "+" para cima. Centralizar por
  flex ignora a linha de base e resolve os dois de uma vez.
-->
<template>
  <SfQuantitySelector
    v-bind="props"
    v-model="model"
    class="shrink-0 rounded border border-base-300
    [&_button]:flex [&_button]:size-9 [&_button]:items-center
    [&_button]:justify-center [&_button]:leading-none
    [&_button_i]:m-0 [&_input]:size-9 [&_input]:text-sm"
  >
    <template #minus>
      <i class="text-base i-minus"></i>
    </template>
    <template #plus>
      <i class="text-base i-plus"></i>
    </template>
  </SfQuantitySelector>
</template>

<script setup lang="ts">
import SfQuantitySelector from '@@sf/components/QuantitySelector.vue';

export type Props = {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readonly?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  min: 1,
  max: undefined,
  step: undefined,
  disabled: false,
  readonly: false,
});
const model = defineModel<number>({ default: 1 });
</script>
