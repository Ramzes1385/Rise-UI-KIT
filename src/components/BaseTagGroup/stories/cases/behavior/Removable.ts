import { expect } from 'storybook/test'
import type meta from '../../BaseTagGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTagGroup from '../../../ui/BaseTagGroup.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const cities = [
	{ value: 'msk', label: 'Москва' },
	{ value: 'spb', label: 'Санкт-Петербург' },
	{ value: 'kzn', label: 'Казань' },
	{ value: 'sochi', label: 'Сочи' },
]

const state = { tags: cities }

const template = `
	<BaseTagGroup v-bind="args" :items="tags" @remove="item => (tags = tags.filter(tag => tag.value !== item.value))" />
`

export const Removable: StoryObj<typeof meta> = {
	args: { selectionMode: 'none', isRemovable: true, label: 'Города доставки', tone: 'info', modelValue: null },
	parameters: {
		controls: { include: ['variant', 'tone', 'selectionMode', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Удаление: кнопка «Удалить метку …» или Delete и Backspace — событие `remove`; приложение убирает метку из `items`.',
					'Фокус переходит на следующую метку, у последней — на предыдущую: клавиатура не теряет место.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTagGroup'],
				state,
				script: `const cities = ${literal(cities)}`,
				omit: ['items'],
			}),
		},
	},
	render: args => ({
		components: { BaseTagGroup },
		setup: useStorySetup(args, { state, slots: ['tag'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить метку Санкт-Петербург' }))
		await expect(canvas.queryByText('Санкт-Петербург')).toBeNull()
		const kazan = canvas.getByRole('button', { name: 'Удалить метку Казань' })
		await expect(kazan).toHaveFocus()
		await userEvent.keyboard('{Delete}')
		await expect(canvas.getByRole('button', { name: 'Удалить метку Сочи' })).toHaveFocus()
		await userEvent.keyboard('{Backspace}')
		await expect(canvas.getByRole('button', { name: 'Удалить метку Москва' })).toHaveFocus()
	},
}
