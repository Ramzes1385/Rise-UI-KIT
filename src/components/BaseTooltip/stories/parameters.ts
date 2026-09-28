import type { Meta } from '@storybook/vue3-vite'
import type BaseTooltip from '../ui/BaseTooltip.vue'

export const parameters = {
	layout: 'centered',
	docs: {
		description: {
			component: [
				'Короткая подсказка к элементу: название кнопки-иконки, пояснение к сокращению, горячая клавиша.',
				'',
				'- Появляется при наведении и при фокусе с клавиатуры, скрывается при уходе курсора или фокуса и по Escape.',
				'- `position` — сторона (`top`, `bottom`, `left`, `right`), `isAlwaysVisible` — показывать постоянно.',
				'- Подсказка телепортируется в body (`role="tooltip"`); вариант, `sizeScale` и `color` применяются к ней,',
				'  а не к элементу в слоте.',
				'- Не кладите в подсказку ссылки и кнопки: для интерактивного содержимого — `BasePopover`.',
				'  Кнопке с одной иконкой нужен ещё `aria-label`: подсказка его не заменяет.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseTooltip>['parameters']
