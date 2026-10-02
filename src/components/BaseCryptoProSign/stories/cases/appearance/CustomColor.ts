import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCryptoProSign.stories'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Кастомный цвет через `color`. Для статусов берите токены ролей: `var(--rise-success-soft)`.' } },
	},
	args: { color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-crypto-pro-sign') as HTMLElement
		await expect(getComputedStyle(element).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}
