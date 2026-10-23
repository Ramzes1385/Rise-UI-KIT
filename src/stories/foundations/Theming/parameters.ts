import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Тема — это значения токенов. Светлая действует по умолчанию, тёмная включается атрибутом `data-theme="dark"`',
				'на `<html>` или на любом контейнере. Внутри тёмной области можно вернуть светлую — `data-theme="light"`.',
				'',
				'Бренд перекрашивается палитрой `--rise-color-primary-50 … 950`: на `:root` — для всего приложения,',
				'на элементе с `data-theme` — для части интерфейса. Скругления всего интерфейса задаёт одна база `--rise-radius`.',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
