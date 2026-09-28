import type { Meta } from '@storybook/vue3-vite'
import type BaseScrollArea from '../ui/BaseScrollArea.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Область прокрутки с тонкой полосой поверх содержимого — одинаковой в Windows, macOS и Linux.',
				'',
				'- Прокручивает родной элемент: колесо, касание, клавиатура и «Найти на странице» работают как обычно.',
				'  Полосы — только для мыши (`aria-hidden`): клик по полосе, перетаскивание ползунка.',
				'- `orientation`: `vertical`, `horizontal` или `both`; `maxHeight` — наибольшая высота; `scrollbar`: `hover` или `always`.',
				'- Область с прокруткой получает tabindex="0": её можно прокрутить стрелками (WCAG 2.1.1).',
				'  С `ariaLabel` она ещё и ориентир (`role="region"`).',
				'- Методы через ref: `scrollTo`, `scrollToTop`, `scrollToBottom`, `update`, `getViewport`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseScrollArea>['parameters']
