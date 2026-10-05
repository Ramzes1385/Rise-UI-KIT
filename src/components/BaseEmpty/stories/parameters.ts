import { source } from './render'
import type BaseEmpty from '../ui/BaseEmpty.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Пустое состояние: в списке ещё нет данных, поиск ничего не нашёл, раздел недоступен.',
				'Объясняет, почему пусто, и предлагает следующий шаг.',
				'',
				'- `title` и `description` — что случилось и что делать; `icon` — иконка из спрайта (по умолчанию `inbox`).',
				'- Слоты: `icon` — своя иллюстрация, по умолчанию — дополнительный текст, `actions` — кнопки.',
				'- Варианты: `default` — пунктирная рамка, `soft` — мягкий фон, `ghost` — без рамки и отступов,',
				'  для встраивания в карточку, таблицу или выпадающий список.',
				'- Перекраска — токены `--rise-empty-*`, классы частей — проп `ui` (история «Токены»); движение — история «Анимации».',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseEmpty>['parameters']
