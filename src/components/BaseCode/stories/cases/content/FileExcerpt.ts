import { expect } from 'storybook/test'
import type meta from '../../BaseCode.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const FileExcerpt: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Отрывок файла: `title` — имя файла, `startLine` — номер первой строки, `highlightLines` — выделенные строки (номера от `startLine`).',
			},
		},
	},
	args: {
		title: 'src/composables/useCounter.ts',
		startLine: 12,
		highlightLines: [16, 17],
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByText('src/composables/useCounter.ts')).toBeVisible()
		const highlighted = canvasElement.querySelectorAll('.base-code__line--highlighted')
		await expect(highlighted).toHaveLength(2)
		await expect(highlighted[0]!.querySelector('.base-code__number')).toHaveTextContent('16')
	},
}
