import { expect } from 'storybook/test'
import { nodeHeader } from '../../shared'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseTree.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура по образцу APG Tree View. В порядке Tab один узел: Tab входит в дерево и выходит из него.',
					'↓/↑ — соседний видимый узел, → — раскрыть папку или перейти к первому вложенному, ← — свернуть или к родителю,',
					'Home/End — первый и последний узел, `*` — раскрыть все папки уровня, буквы — к узлу по началу подписи,',
					'Enter — действие узла (раскрыть, выбрать, перейти по ссылке), пробел — выбор.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { expandedIds: [] },
	play: async ({ canvasElement, userEvent }) => {
		const src = nodeHeader(canvasElement, 'src')
		await tabTo(src, userEvent)
		await expect(getComputedStyle(src).outlineStyle).toBe('solid')

		await userEvent.keyboard('{ArrowRight}')
		await expect(src).toHaveAttribute('aria-expanded', 'true')
		await userEvent.keyboard('{ArrowRight}')
		await expect(nodeHeader(canvasElement, 'components')).toHaveFocus()
		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await expect(nodeHeader(canvasElement, 'App.vue')).toHaveFocus()
		await userEvent.keyboard('{ArrowLeft}')
		await expect(src).toHaveFocus()
		await userEvent.keyboard('{ArrowLeft}')
		await expect(src).toHaveAttribute('aria-expanded', 'false')

		await userEvent.keyboard('{End}')
		await expect(nodeHeader(canvasElement, 'README.md')).toHaveFocus()
		await userEvent.keyboard('p')
		await expect(nodeHeader(canvasElement, 'public')).toHaveFocus()
		await userEvent.keyboard('{Home}*')
		await expect(nodeHeader(canvasElement, 'public')).toHaveAttribute('aria-expanded', 'true')
		await expect(src).toHaveFocus()

		await userEvent.tab()
		await expect(canvasElement.querySelector('.base-tree')?.contains(document.activeElement)).toBe(false)
	},
}
