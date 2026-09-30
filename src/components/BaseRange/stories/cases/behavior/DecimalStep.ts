import type meta from '../../BaseRange.stories'
import { waitFor, expect } from 'storybook/test'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { opacity: 0.5 }

const template = `
	<div class="story-narrow"><BaseRange v-bind="args" v-model="opacity" /></div>
`

export const DecimalStep: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Дробный шаг: значения кратны 0.1 без хвостов плавающей точки (0.3, а не 0.30000000000000004).' },
			source: storySource({ template, imports: ['BaseRange'], state, omit: ['modelValue', 'thumb', 'onUpdate:modelValue'] }),
		},
	},
	args: { modelValue: 0.5, min: 0, max: 1, step: 0.1, ariaLabel: 'Прозрачность', hasLabel: true },
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, { state, slots: ['modelValue', 'thumb', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const thumb = canvas.getByRole('slider', { name: 'Прозрачность' })
		await tabTo(thumb, userEvent)
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
		await waitFor(() => expect(thumb).toHaveAttribute('aria-valuenow', '0.3'))
		await expect(canvas.getByText('0.3')).toBeVisible()
	},
}
