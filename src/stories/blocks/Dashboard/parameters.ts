import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	layout: 'fullscreen',
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Дашборд из компонентов кита: каркас BaseLayout с BaseHeader и BaseSideBar, карточки BaseCard с показателями',
				'и BaseSparkline, доли BasePieChart, календарь активности BaseHeatmap, таблица BaseTable, лента BaseTimeline и',
				'палитра команд BaseCommandPalette. Цвета графиков — токены `--rise-chart-1…8`, текст — токены текста.',
				'Данные придуманы и зашиты в историю, дата календаря активности задана, чтобы картинка не менялась со временем.',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
