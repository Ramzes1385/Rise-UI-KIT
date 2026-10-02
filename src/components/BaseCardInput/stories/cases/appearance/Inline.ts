import { expect } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCardInput from '../../../ui/BaseCardInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-medium"><BaseCardInput v-bind="args" /></div>`

export const Inline: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Раскладка `inline`: номер, срок и код в одну строку — для узких форм оплаты без имени владельца.',
			},
			source: storySource({ template, imports: ['BaseCardInput'] }),
		},
	},
	args: { layout: 'inline', hasHolder: false },
	render: args => ({
		components: { BaseCardInput },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const number = canvas.getByLabelText('Номер карты').getBoundingClientRect()
		const code = canvas.getByLabelText('Код').getBoundingClientRect()
		await expect(Math.abs(number.top - code.top)).toBeLessThan(2)
		await expect(canvas.queryByLabelText('Имя владельца')).toBeNull()
	},
}
