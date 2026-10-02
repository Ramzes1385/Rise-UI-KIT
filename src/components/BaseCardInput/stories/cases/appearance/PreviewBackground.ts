import { expect } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

const BACKGROUND = 'linear-gradient(135deg, var(--rise-color-primary-700), var(--rise-color-primary-950))'

export const PreviewBackground: StoryObj<typeof meta> = {
	args: { hasPreview: true, previewBackground: BACKGROUND },
	parameters: {
		docs: {
			description: {
				story: [
					'Свой фон превью — `previewBackground` (любое значение CSS `background`): он сильнее фона по марке.',
					'Пустые поля — на карте подсказки: точки номера, «IVAN IVANOV» и «ММ/ГГ».',
				].join('\n'),
			},
		},
	},
	play: async ({ canvasElement }) => {
		const preview = canvasElement.querySelector('.base-card-input__preview') as HTMLElement
		await expect(preview.style.getPropertyValue('--base-card-input-face-bg')).toBe(BACKGROUND)
		await expect(preview.querySelector('.base-card-input__face-number')).toHaveTextContent('•••• •••• •••• ••••')
		await expect(preview.querySelector('.base-card-input__face-holder')).toHaveTextContent('IVAN IVANOV')
		await expect(preview.querySelector('.base-card-input__face-expiry')).toHaveTextContent('ММ/ГГ')
	},
}
