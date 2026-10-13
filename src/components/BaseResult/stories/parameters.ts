import type { Meta } from '@storybook/vue3-vite'
import type BaseResult from '../ui/BaseResult.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Экран итога: результат операции или страница ошибки — иконка, заголовок, описание, подробности и кнопки действий.',
				'',
				'- `status` — `success`, `info`, `warning`, `error` (иконка роли) и `403`, `404`, `500` (вместо иконки крупный код;',
				'  цвет — `warning`, `info` и `error`). Заголовок и описание по умолчанию берутся из словаря по статусу, `title` и `description` их заменяют.',
				'- `variant` — `default` без рамки и фона (на странице), `soft` — мягкий фон карточки, `outline` — рамка.',
				'- Слоты: `icon`, `title`, `description`, `default` (подробности: код ошибки, причины), `extra` (кнопки действий).',
				'- Доступность: `titleTag` задаёт уровень заголовка — `h1` для страницы ошибки, `h2`–`h6` для итога внутри раздела.',
				'  Код `403`/`404`/`500` скрыт от скринридера (`aria-hidden`), смысл несёт заголовок. `isLive` озвучивает появление экрана на месте формы:',
				'  `success` и `info` — `role="status"`, `warning` и `error` — `role="alert"`; для страниц ошибок включать не нужно.',
				'- Перекраска — токены `--rise-result-*`, классы частей — проп `ui` (история «Theming»); анимаций у компонента нет.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseResult>['parameters']
