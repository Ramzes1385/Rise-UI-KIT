import type { Meta } from '@storybook/vue3-vite'
import type BaseSlideover from '../ui/BaseSlideover.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Панель у края экрана: фильтры, детали записи, форма, которую удобно заполнять, не уходя со страницы.',
				'',
				'- Открытие и закрытие — `v-model:is-open`; закрывают кнопка «Закрыть» в шапке, Escape (`closeOnEscape`)',
				'  и клик по подложке (`closeOnOverlay`).',
				'- Доступность как у `BaseModal`: `role="dialog"`, `aria-modal`, имя из `title`, фокус внутри панели,',
				'  возврат фокуса на кнопку после закрытия, блокировка прокрутки страницы.',
				'- `side` — край экрана, `width` — ширина в процентах от 420px, `isFullWidth` — на весь экран;',
				'  на телефоне панель всегда во всю ширину.',
				'- `isContained` или `container` — панель внутри блока (немодальная). `padding` — отступы секций.',
				'',
				'Диалог по центру экрана — `BaseModal`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSlideover>['parameters']
