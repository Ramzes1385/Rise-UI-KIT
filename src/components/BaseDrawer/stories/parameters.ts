import type { Meta } from '@storybook/vue3-vite'
import type BaseDrawer from '../ui/BaseDrawer.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Выдвижная панель у края окна: нижний лист на телефоне (фильтры, действия, корзина) или панель сверху и сбоку.',
				'',
				'- Открытие и закрытие — `v-model:is-open`; закрывают кнопка «Закрыть», Escape, клик по затемнению',
				'  и перетаскивание за ручку или шапку к краю дальше четверти панели (`isDraggable`).',
				'- Доступность как у BaseModal: `role="dialog"`, `aria-modal`, имя из `title` (или `ariaLabel`),',
				'  описание из `description`, фокус заперт в панели и возвращается к кнопке, прокрутка страницы заблокирована.',
				'- `direction`: `bottom`, `top`, `left`, `right`; `hasHandle` — полоска-ручка; слоты `header` и `footer`.',
				'',
				'Панель во всю высоту для форм и деталей записи — BaseSlideover; диалог по центру — BaseModal.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseDrawer>['parameters']
