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

export const Expired: StoryObj<typeof meta> = {
	args: { brand: 'mastercard', last4: '4444', expiry: '01/20', label: 'Рабочая' },
	parameters: {
		docs: {
			description: {
				story: [
					'Истёкшая карта: срок раньше текущего месяца — плашка «Истекла», полная карта приглушена. Свой признак — `isExpired`.',
					'Чтение с экрана получает «…, срок истёк 01/20».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseBankCard'] }),
		},
	},
	render: args => ({
		components: { BaseBankCard },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByText('Mastercard, номер заканчивается на 4444, срок истёк 01/20')).toHaveLength(2)
		await expect(canvas.getAllByText('Истекла')).toHaveLength(2)
	},
}
