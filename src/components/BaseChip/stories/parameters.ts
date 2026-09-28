import type BaseChip from '../ui/BaseChip.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Индикатор в углу элемента: число непрочитанных у кнопки, метка «Новое» у пункта, статус у аватара.',
				'Оборачивает элемент (слот по умолчанию) и ставит над его углом пилюлю с `content`.',
				'',
				'- `placement` — угол; `hasOverflow` + `maxValue` показывают «99+»; `isHiddenOnZero` прячет индикатор при нуле.',
				'- Варианты как у кнопки: `default` — заливка основным цветом, `soft` — мягкий фон, `outline`, `ghost`, `shadow` — нейтральные.',
				'  Красный счётчик — проп `color` с токенами роли error.',
				'- Индикатор не получает фокус: если число важно, продублируйте его в доступном имени элемента.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseChip>['parameters']
