import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Страницы ошибок 404 и 500 на BaseEmpty (вариант `ghost`) с BaseSearch, BaseButton, BaseLink и BaseAlert.',
				'Код ошибки — крупная подпись для глаз, заголовок страницы — `h1` с текстом ошибки: скринридер слышит смысл, а не число.',
				'На 404 — поиск по сайту и популярные разделы, на 500 — повтор запроса, номер обращения для поддержки и статус.',
				'Код экрана — во вкладке «Show code».',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
