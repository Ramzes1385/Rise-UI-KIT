import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAccordion from '../ui/BaseAccordion.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Аккордеон показывает список разделов, содержимое которых раскрывается по клику на заголовок: FAQ, настройки, фильтры.',
				'',
				'- Пункты задаёт `items`: заголовок `label`, текст `content` или именованный слот `slot`, `icon`, `defaultOpen`, `isDisabled`.',
				'- По умолчанию открыт один пункт (из нескольких `defaultOpen` — первый); `isMultiple` позволяет раскрыть несколько.',
				'  Событие `toggle(index, isOpen)` приходит и для пункта, закрытого открытием другого.',
				'- `v-model:open` — список открытых пунктов по ключу: `id` пункта, иначе `label`. По ключу открытые пункты',
				'  сохраняются, когда `items` меняются; новый пункт с `defaultOpen` открывается при подгрузке.',
				'- Доступность по APG Accordion: заголовок `<h3>` (уровень — `headingLevel`) с кнопкой `<button>` внутри,',
				'  `aria-expanded` и `aria-controls`, панель — `region`; Enter и Space раскрывают пункт. Отключённый пункт',
				'  остаётся в порядке Tab с `aria-disabled`. Закрытая панель помечена `inert`: её ссылки и поля не попадают в',
				'  порядок Tab.',
				'- Варианты: `default` — линии между пунктами; `ghost` — без линий; `outline`, `shadow`, `soft` — в контейнере;',
				'  `separated` — пункты отдельными карточками.',
				'- Настройка вида: `arrowPosition` (стрелка справа или перед заголовком), `showArrow`, свои значки `expandIcon` и',
				'  `collapseIcon`, линия `divider`, плотность `density`, выделение открытого пункта `isAccented`, пояснение под',
				'  заголовком — поле пункта `description`. Цвета заголовков — `color`.',
				'- Перекраска — токены `--rise-accordion-*`, классы частей — проп `ui` (история «Токены»); раскрытие — `expand-rows`',
				'  на токенах движения (история «Анимации»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseAccordion>['parameters']
