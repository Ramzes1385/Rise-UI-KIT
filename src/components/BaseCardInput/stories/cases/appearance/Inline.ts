import { expect } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCardInput from '../../../ui/BaseCardInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-medium"><BaseCardInput v-bind="args" /></div>`

const WRAP_WIDTH = 503

export const Inline: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Раскладка `inline`: номер, срок и код в одну строку — для узких форм оплаты без имени владельца. Если контейнер уже 503 px (телефон), номер уходит на отдельную строку, срок и код остаются рядом.',
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
		const numberInput = canvas.getByLabelText('Номер карты')
		const number = numberInput.getBoundingClientRect()
		const expiry = canvas.getByLabelText('Срок действия').getBoundingClientRect()
		const code = canvas.getByLabelText('Код').getBoundingClientRect()
		const fieldsWidth = (numberInput.closest('.base-card-input__fields') as HTMLElement).clientWidth
		await expect(Math.abs(expiry.top - code.top)).toBeLessThan(2)
		if (fieldsWidth > WRAP_WIDTH) await expect(Math.abs(number.top - code.top)).toBeLessThan(2)
		else await expect(code.top).toBeGreaterThan(number.bottom)
		await expect(canvas.queryByLabelText('Имя владельца')).toBeNull()
	},
}
