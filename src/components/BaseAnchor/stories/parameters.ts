import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAnchor from '../ui/BaseAnchor.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Оглавление страницы: ссылки на разделы и подсветка того, который сейчас читают.',
				'',
				'- Пункты — `items` (с вложенными `children`) или заголовки `headings` (по умолчанию `h2, h3`) внутри `content`;',
				'  заголовку без id компонент присваивает id.',
				'- `target` — прокручиваемый контейнер (по умолчанию окно). Текущий раздел — последний, чей верх выше линии `offset`;',
				'  следит IntersectionObserver, без обработчика прокрутки. `v-model:active` — id текущего.',
				'- Клик: плавная прокрутка (без анимации при «уменьшении движения»), фокус переходит к разделу, адрес — `#id`',
				'  (`isHashSynced`). Клик с Ctrl, Cmd, Shift или средней кнопкой — как у обычной ссылки.',
				'- Доступность: `<nav>` с именем «Содержание» (`label`), у текущего пункта `aria-current="location"`.',
				'- Отметка текущего пункта одна на оглавление и переезжает к новому на токенах движения (история «Анимации»).',
				'- Перекраска — токены `--rise-anchor-*`, классы частей — проп `ui` (история «Токены»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseAnchor>['parameters']
