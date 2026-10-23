import { expect } from 'storybook/test'
import type meta from '../BaseBankCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: полная карта Visa с названием «Основная». Меняйте марку, `last4`, срок и вид (`isCompact`) в Controls.',
			},
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Основная')).toBeVisible()
		await expect(canvas.getByText('Visa, номер заканчивается на 4242, срок до 12/34')).toBeInTheDocument()
		await expect(canvas.getByText('•••• 4242')).toBeVisible()
	},
}
