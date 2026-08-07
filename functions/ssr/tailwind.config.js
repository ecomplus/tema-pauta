import { fileURLToPath } from 'node:url';
// Lucide: neutro, traço uniforme, cobertura boa de ícone de documento.
import { icons as iLucide } from '@iconify-json/lucide';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
process.env.STOREFRONT_BASE_DIR = __dirname;

// eslint-disable-next-line import/first
import { genTailwindConfig } from '@cloudcommerce/storefront/config/storefront.tailwind.mjs';

/*
 * Tema da variante "Pauta" (papelaria e material de escritório).
 *
 * As cores de marca (primary/secondary) NÃO vêm daqui: são lidas de
 * `content/settings.json` pelo próprio `genTailwindConfig`, para continuarem
 * editáveis pelo CMS. Aqui fica só o que o CMS não expõe.
 *
 * Azul de tinta de caneta com amarelo de marca-texto. A dupla não é
 * decorativa: o amarelo aparece SÓ como grifo — atrás de um trecho de texto,
 * nunca como preenchimento de bloco. É o que amarra a marca ao objeto que a
 * loja vende.
 *
 * Neutro levemente FRIO, quase o cinza de papel sulfite.
 *
 * TODO: validar — este nicho ainda NÃO tem marca em
 * `www.e-com.plus/src/config/brands.ts` nem página de segmento. A paleta é
 * proposta, não veio de levantamento de temas campeões do nicho.
 */
const themeOptions = {
  generalIconSets: [iLucide],
  baseColor: {
    50: '#f9fafb',
    100: '#f1f3f6',
    200: '#e3e7ec',
    300: '#c8cfd8',
    400: '#98a3b2',
    500: '#717d8e',
    600: '#586372',
    700: '#464f5c',
    800: '#353c46',
    900: '#20252c',
    950: '#12151a',
  },
};

const tailwindConfig = genTailwindConfig(themeOptions);

tailwindConfig.theme.extend.borderRadius = {
  ...tailwindConfig.theme.extend.borderRadius,
  DEFAULT: '0.25rem',
};

export default {
  ...tailwindConfig,
  themeOptions,
};
