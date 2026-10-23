import { expect } from 'storybook/test'
import type meta from '../../BaseBankCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'

const BG = 'var(--rise-primary-soft)'
const TEXT = 'var(--rise-primary-text)'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет строки `isCompact` через `color` — здесь пара токенов роли `var(--rise-primary-soft)` и `var(--rise-primary-text)`: они подстраиваются под тему и в любом пресете держат контраст подписей. Фон полной карты — проп `background`.',
			},
		},
	},
	args: { isCompact: true, color: { bg: { base: BG }, text: { base: TEXT } } },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-bank-card') as HTMLElement
		await expect(element.getAttribute('style')).toContain(BG)
		const probe = document.createElement('span')
		probe.style.backgroundColor = BG
		canvasElement.append(probe)
		await expect(getComputedStyle(element).backgroundColor).toBe(getComputedStyle(probe).backgroundColor)
		probe.remove()
	},
}
