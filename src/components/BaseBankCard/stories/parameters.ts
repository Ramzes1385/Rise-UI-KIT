import type { Meta } from '@storybook/vue3-vite'
import type BaseBankCard from '../ui/BaseBankCard.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Сохранённая банковская карта: марка, `•••• 4242`, срок и «Истекла». Полный вид — лицевая сторона с фоном по марке; `isCompact` — строка для списков выбора карты.',
				'',
				'- Варианты (`default`, `soft`, `outline`, `ghost`) меняют только строку `isCompact`.',
				'- Чтение с экрана получает одну фразу: «Visa, номер заканчивается на 4242, срок до 12/30»; точки и значок скрыты.',
				'- Перекраска — токены `--rise-bank-card-*`, классы частей — проп `ui` (история «Токены»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseBankCard>['parameters']
