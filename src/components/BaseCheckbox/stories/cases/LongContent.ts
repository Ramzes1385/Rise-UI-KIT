import { expect } from 'storybook/test'
import type meta from '../BaseCheckbox.stories'
import BaseCheckbox from '../../ui/BaseCheckbox.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { checked: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseCheckbox v-bind="args" v-model="checked" /></div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинная подпись переносится по словам, а квадрат остаётся у первой строки (ширина контейнера 360px).' },
			source: storySource({ template, imports: ['BaseCheckbox'], models }),
		},
	},
	args: {
		modelValue: true,
		label: 'Я согласен на обработку персональных данных, получение уведомлений о статусе заказа и рассылку с персональными предложениями',
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const box = canvasElement.querySelector('.base-checkbox__box') as HTMLElement
		const label = canvasElement.querySelector('.base-checkbox__label') as HTMLElement
		await expect(label.getBoundingClientRect().height).toBeGreaterThan(40)
		await expect(Math.round(box.getBoundingClientRect().top - label.getBoundingClientRect().top)).toBe(2)
	},
}
