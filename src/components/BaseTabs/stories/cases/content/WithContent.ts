import type meta from '../../BaseTabs.stories'
import BaseTabs from '../../../ui/BaseTabs.vue'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const PANELS: Record<string, string> = {
	overview: 'Лёгкий ноутбук с экраном 13 дюймов и автономностью до 18 часов.',
	specs: 'Процессор 8 ядер, 16 ГБ памяти, накопитель 512 ГБ, вес 1,2 кг.',
	reviews: 'Средняя оценка 4,8 по 126 отзывам покупателей.',
	delivery: 'Доставка курьером за 1–2 дня или самовывоз из пункта выдачи.',
}

const panels = PANELS

const models = { tab: 'modelValue' }

const template = `
	<BaseTabs v-bind="args" v-model="tab">
		<div>{{ panels[tab] }}</div>
	</BaseTabs>
`

export const WithContent: StoryObj<typeof meta> = {
	args: { variant: 'arc' },
	parameters: {
		docs: {
			description: {
				story: [
					'Содержимое панели — слот по умолчанию. Панель получает `role="tabpanel"`, подписана активной вкладкой и',
					'доступна по Tab, чтобы с клавиатуры можно было перейти к её содержимому.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTabs'], models, script: `const panels = ${literal(panels)}` }),
		},
	},
	render: args => ({
		components: { BaseTabs },
		setup: useStorySetup(args, { models, data: { panels }, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('tab', { name: 'Отзывы' }))
		await waitFor(() => expect(canvas.getByRole('tabpanel', { name: 'Отзывы' })).toHaveTextContent('Средняя оценка 4,8'))
	},
}
