import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseLayout from '../ui/BaseLayout.vue'

export const parameters = {
	layout: 'fullscreen',
	docs: {
		source,
		description: {
			component: [
				'Каркас страницы на всю высоту окна: шапка, боковое меню, основное содержимое и подвал.',
				'',
				'- Слоты: `header` (BaseHeader), `sidebar` (BaseSideBar или своя навигация), default — содержимое в `<main>`, `footer` (BaseFooter).',
				'- Первая остановка Tab — ссылка «Перейти к содержимому» (видна только в фокусе): переносит фокус в `<main>`',
				'  мимо шапки и меню (WCAG 2.4.1). Отключается `hasSkipLink`, текст — `skipLinkLabel`.',
				'- `isHeaderSticky` — шапка прилипает к верху, боковое меню встаёт под неё и прокручивается отдельно.',
				'- Подвал прижат к низу окна и на короткой странице.',
				'- На экране уже 768px боковое меню скрыто: положите ту же навигацию в слот `menu` у BaseHeader.',
				'  `isSidebarVisibleOnMobile` оставляет меню видимым.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseLayout>['parameters']
