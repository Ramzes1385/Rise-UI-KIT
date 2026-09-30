import { source } from './render'
import type BaseTabs from '../ui/BaseTabs.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Вкладки переключают разделы одной области без перехода на другую страницу.',
				'',
				'- `v-model` хранит `id` активной вкладки; содержимое панели передаётся в слот по умолчанию.',
				'- Варианты: `underline` (по умолчанию) — линия под активной вкладкой; `pills` и `rounded` — вкладки в контейнере;',
				'  `arc` — вкладки со скруглением сверху.',
				'- Клавиатура по APG Tabs: в порядке Tab только выбранная вкладка, стрелки ←/→ с зацикливанием, Home/End;',
				'  отключённые вкладки пропускаются. Выбор следует за фокусом.',
				'- `isScrollable` добавляет кнопки прокрутки при переполнении; список можно тянуть мышью.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseTabs>['parameters']
