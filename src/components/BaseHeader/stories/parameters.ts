import type { Meta } from '@storybook/vue3-vite'
import type BaseHeader from '../ui/BaseHeader.vue'

export const parameters = {
	layout: 'fullscreen',
	docs: {
		description: {
			component: [
				'Шапка сайта или приложения: название, основная навигация и действия.',
				'',
				'- `<header>` вне `<main>` — ориентир `banner`. `title` с `to` или `href` — ссылка на главную; слот `start` — логотип.',
				'- Слоты: default — навигация посередине, `end` — действия (поиск, тема, профиль).',
				'- Слот `menu` — меню для узкого экрана: ниже 768px навигация прячется, кнопка «Меню» (`aria-expanded`)',
				'  открывает его в BaseDrawer (`menuDirection`). Слот получает `close`, чтобы закрыть меню после перехода.',
				'- `isSticky` — прилипает к верху окна; `containerSize` — ширина содержимого, как у BaseContainer.',
				'- `variant`: `default` — линия снизу, `soft` — приглушённый фон, `ghost` — прозрачная (поверх обложки).',
				'- Раскладки: `navAlign` — навигация посередине (лендинг), за названием (приложение), у действий или на всё место (поиск);',
				'  слот `bottom` — второй ряд (категории магазина); `isCompact` — высота 48px; `isOverlay` — поверх обложки.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseHeader>['parameters']
