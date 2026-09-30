import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseBackTop from '../ui/BaseBackTop.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Кнопка «Наверх» для длинных страниц и списков: появляется после прокрутки и возвращает к началу.',
				'',
				'- `target` — прокручиваемый контейнер (селектор или элемент), по умолчанию окно; `visibilityHeight` — после',
				'  какой прокрутки кнопка появляется.',
				'- Прокрутка плавная, если пользователь не включил «уменьшение движения» (`prefers-reduced-motion`).',
				'- После прокрутки фокус переходит в начало: в контейнер или в `<main>` страницы (`focusTarget` — своё место),',
				'  иначе он остался бы внизу, на исчезнувшей кнопке.',
				'- Оформление и положение — как у BaseFab: `variant`, `position`, `isExtended` (с подписью), `isContained`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseBackTop>['parameters']
