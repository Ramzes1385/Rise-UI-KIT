import { expect } from 'storybook/test'
import type meta from '../../BaseRadio.stories'
import BaseRadio from '../../../ui/BaseRadio.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { picked: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseRadio v-bind="args" v-model="picked" /></div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинные подписи переносятся по словам, круг остаётся у первой строки (ширина контейнера 360px).' },
			source: storySource({ template, imports: ['BaseRadio'], models }),
		},
	},
	args: {
		label: 'Что сделать, если товара не окажется в наличии',
		name: 'out-of-stock',
		modelValue: 'replace',
		isVertical: true,
		options: [
			{ value: 'replace', label: 'Заменить на аналогичный товар того же бренда с похожими характеристиками и ценой' },
			{ value: 'call', label: 'Позвонить мне и согласовать замену до сборки заказа' },
			{ value: 'remove', label: 'Убрать товар из заказа и вернуть деньги на карту' },
		],
	},
	argTypes: { modelValue: { control: 'inline-radio', options: ['replace', 'call', 'remove'] } },
	render: args => ({
		components: { BaseRadio },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas }) => {
		const radio = canvas.getByRole('radio', { name: /Заменить на аналогичный/ })
		const label = canvas.getByText(/Заменить на аналогичный/)
		await expect(label.getBoundingClientRect().height).toBeGreaterThan(20)
		const circle = radio.nextElementSibling as HTMLElement
		await expect(Math.round(circle.getBoundingClientRect().top - label.getBoundingClientRect().top)).toBe(2)
	},
}
