import { CODE_SAMPLES } from '../../shared'
import type meta from '../../BaseCode.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const MaxHeight: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`max-height` — длинный код прокручивается по вертикали внутри блока; область получает фокус с клавиатуры.',
			},
		},
	},
	args: { code: CODE_SAMPLES.python, language: 'py', maxHeight: 120 },
	play: async ({ canvas }) => {
		const region = await waitFor(() => canvas.getByRole('region', { name: 'Код, Python' }))
		await expect(region.scrollHeight).toBeGreaterThan(region.clientHeight)
		await expect(region).toHaveAttribute('tabindex', '0')
	},
}
