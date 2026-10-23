import { expect } from 'storybook/test'
import type meta from '../../BaseBankCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBankCard from '../../../ui/BaseBankCard.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-col">
		<BaseBankCard v-bind="args" />
		<BaseBankCard v-bind="args" is-compact />
	</div>
`

export const WithoutBrand: StoryObj<typeof meta> = {
	args: { brand: null, last4: '1111' },
	parameters: {
		docs: {
			description: {
				story: 'Марка неизвестна (`brand: null` или id, которого нет в `CARD_BRAND_IDS`): без значка, фон по умолчанию, для чтения с экрана — «Карта, номер заканчивается на 1111».',
			},
			source: storySource({ template, imports: ['BaseBankCard'] }),
		},
	},
	render: args => ({
		components: { BaseBankCard },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getAllByText('Карта, номер заканчивается на 1111, срок до 12/34')).toHaveLength(2)
		await expect(canvasElement.querySelector('.card-brand-mark')).toBeNull()
	},
}
