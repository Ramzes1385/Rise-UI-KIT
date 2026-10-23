import { expect } from 'storybook/test'
import type meta from '../../BaseQrCode.stories'
import { QR_SOURCE, renderQr } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const TooLong: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Текст не помещается в версию 40 при выбранном уровне — вместо кода сообщение, для скринридера — то же.',
			},
			source: QR_SOURCE,
		},
	},
	args: { value: 'Длинный текст '.repeat(60), errorCorrection: 'H' },
	render: renderQr,
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: 'Текст слишком длинный для QR-кода' })).toBeVisible()
	},
}
