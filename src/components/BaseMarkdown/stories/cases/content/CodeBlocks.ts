import { expect } from 'storybook/test'
import { CODE_SAMPLE } from '../../shared'
import type meta from '../../BaseMarkdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CodeBlocks: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Блоки кода подсвечиваются по языку после трёх обратных кавычек — тем же токенизатором, что BaseCode',
					'(js, ts, json, html, vue, css, scss, bash, python и их псевдонимы). Неизвестный язык — простой текст.',
				].join('\n'),
			},
		},
	},
	args: { source: CODE_SAMPLE },
	play: async ({ canvasElement }) => {
		const blocks = canvasElement.querySelectorAll('pre')
		await expect(blocks).toHaveLength(4)
		await expect(blocks[0]!.querySelector('.base-markdown__token--function')).toHaveTextContent('npm')
		await expect(blocks[1]!.querySelector('.base-markdown__token--keyword')).toHaveTextContent('import')
		await expect(blocks[2]!.querySelector('.base-markdown__token--property')).toHaveTextContent('"sideEffects"')
		await expect(blocks[3]!.querySelector('.base-markdown__token')).toBeNull()
		await expect(blocks[3]).toHaveTextContent('<b>не разметка</b>')
	},
}
