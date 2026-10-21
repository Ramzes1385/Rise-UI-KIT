import { SMALL } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseJsonViewer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseJsonViewer from '../../../ui/BaseJsonViewer.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-json', toolbar: 'story-themed-toolbar', key: 'story-themed-key' }

const template = `
	<div class="story-grid" style="--story-grid-min: 280px; align-items: start;">
		<BaseJsonViewer v-bind="args" label="По умолчанию" />
		<div style="--rise-json-viewer-bg: var(--rise-bg-elevated); --rise-json-viewer-border: var(--rise-primary); --rise-json-viewer-radius: var(--rise-radius-xl); --rise-json-viewer-toolbar-bg: var(--rise-primary-soft); --rise-json-viewer-toolbar-gap: 8px; --rise-json-viewer-padding-x: 12px; --rise-json-viewer-padding-y: 12px; --rise-json-viewer-key-text: var(--rise-primary-text);">
			<BaseJsonViewer v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseJsonViewer v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { value: SMALL },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'hasToolbar'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-json-viewer-*` кит',
					'только читает — задайте их на `:root`, в теме или на контейнере: `bg`, `text`, `border`, `radius`, `padding-x`, `padding-y`',
					'(отступы дерева; умножаются на плотность `--rise-density`), `toolbar-bg`, `toolbar-gap` — панель кнопок, `key-text` — ключи.',
					'Строки узлов, стрелки и выделение — токены BaseTree, кнопки — BaseButton. Проп `ui` добавляет классы к частям `root`,',
					'`toolbar`, `status`, `tree`, `node`, `key`, `colon`, `value`; глобально — `defaults.BaseJsonViewer.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseJsonViewer'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
	},
	render: args => ({
		components: { BaseJsonViewer },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-json-viewer')]
		const part = (root: HTMLElement, name: string) => getComputedStyle(root.querySelector(`.base-json-viewer__${name}`)!)

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(part(themed, 'toolbar').backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
		await expect(part(plain, 'toolbar').backgroundColor).toBe('rgba(0, 0, 0, 0)')
		await expect(part(themed, 'key').color).not.toBe(part(plain, 'key').color)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('12px')
			await expect(part(plain, 'tree').paddingTop).toBe('4px')
			await expect(part(themed, 'tree').paddingTop).toBe('12px')
		}
		await expect(classed).toHaveClass('base-json-viewer', 'story-themed-json')
		await expect(classed.querySelector('.base-json-viewer__toolbar')).toHaveClass('story-themed-toolbar')
		for (const key of classed.querySelectorAll('.base-json-viewer__key')) await expect(key).toHaveClass('story-themed-key')
	},
}
