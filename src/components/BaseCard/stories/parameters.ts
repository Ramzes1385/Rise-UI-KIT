import { source } from './render'
import type BaseCard from '../ui/BaseCard.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Поверхность для группы контента: сводка, настройки, превью объекта.',
				'',
				'- Шапка — `title` и `subtitle` (или слот `header`) и слот `actions` справа; тело — слот по умолчанию; подвал — слот `footer`.',
				'- Варианты: `default` — рамка, `outline` — рамка темнее, `soft` — мягкий фон, `ghost` — без фона и рамки, `shadow` — рамка и тень.',
				'- Отступы секций — 16px 20px; проп `padding` меняет их (например, `0` для картинки во всю ширину).',
				'- `height` + `scroll` — тело прокручивается, шапка и подвал на месте; `height` без `scroll` обрезает текст до трёх строк.',
				'- `isHoverable` — для кликабельных карточек: рамка и тень при наведении, кольцо фокуса. Фокус и клавиатуру',
				'  (`tabindex="0"`, Enter) добавляет приложение.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseCard>['parameters']
