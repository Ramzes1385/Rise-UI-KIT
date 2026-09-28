import type meta from '../BaseTabs.stories'
import BaseTabs from '../../ui/BaseTabs.vue'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

const PANELS: Record<string, string> = {
	overview: 'Лёгкий ноутбук с экраном 13 дюймов и автономностью до 18 часов.',
	specs: 'Процессор 8 ядер, 16 ГБ памяти, накопитель 512 ГБ, вес 1,2 кг.',
	reviews: 'Средняя оценка 4,8 по 126 отзывам покупателей.',
	delivery: 'Доставка курьером за 1–2 дня или самовывоз из пункта выдачи.',
}

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
			source: {
				code: ['<BaseTabs v-model="tab" :items="items" variant="arc">', '  <div>{{ panels[tab] }}</div>', '</BaseTabs>'].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseTabs },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate, panels: PANELS }),
			template: `
				<BaseTabs v-bind="props" @update:model-value="onUpdate">
					<div>{{ panels[props.modelValue] }}</div>
				</BaseTabs>
			`,
		}
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('tab', { name: 'Отзывы' }))
		await waitFor(() => expect(canvas.getByRole('tabpanel', { name: 'Отзывы' })).toHaveTextContent('Средняя оценка 4,8'))
	},
}
