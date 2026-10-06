import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'
import BaseImageMapEditor from '../../../ui/BaseImageMapEditor.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-editor', viewport: 'story-themed-viewport', panel: 'story-themed-panel' }

const template = `
	<div class="story-stack">
		<BaseImageMapEditor v-bind="args" label="По умолчанию" />
		<div style="--rise-image-map-editor-bg: var(--rise-bg-muted); --rise-image-map-editor-border: var(--rise-primary); --rise-image-map-editor-radius: var(--rise-radius-2xl); --rise-image-map-editor-padding: 16px; --rise-image-map-editor-viewport-bg: var(--rise-bg-accented); --rise-image-map-editor-heading-text: var(--rise-primary);">
			<BaseImageMapEditor v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseImageMapEditor v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-image-map-editor-*` кит только читает — задайте их на `:root`, в теме или на контейнере:',
					'рамка редактора — `bg`, `border`, `radius`, `padding`, `gap`; холст — `viewport-bg`, `viewport-radius`; панель свойств —',
					'`panel-gap`, `heading-text`; строки списков — `item-bg-hover`, `item-bg-selected`, `item-border-selected`',
					'(список — docs/design/COMPONENT_TOKENS.md). Отступы умножаются на плотность темы `--rise-density`. Проп `ui` добавляет',
					'классы к частям (`root`, `toolbar`, `viewport`, `stage`, `panel`, `item`… — `IMAGE_MAP_EDITOR_PARTS`); для всех',
					'редакторов приложения — `defaults.BaseImageMapEditor.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImageMapEditor'],
				script: `const ui = ${literal(ui)}`,
				omit: ['label'],
			}),
		},
	},
	render: args => ({
		components: { BaseImageMapEditor },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('region', { name: 'По умолчанию' })
		const themed = canvas.getByRole('region', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('region', { name: 'Классы через ui' })
		const viewport = (editor: HTMLElement) => editor.querySelector<HTMLElement>('.base-image-map-editor__viewport')!

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(viewport(themed)).backgroundColor).not.toBe(getComputedStyle(viewport(plain)).backgroundColor)
		await expect(getComputedStyle(themed).paddingTop).not.toBe(getComputedStyle(plain).paddingTop)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
			await expect(getComputedStyle(themed).paddingTop).toBe('16px')
			await expect(getComputedStyle(plain).paddingTop).toBe('8px')
		}
		await expect(classed).toHaveClass('base-image-map-editor', 'story-themed-editor')
		await expect(viewport(classed)).toHaveClass('story-themed-viewport')
		await expect(classed.querySelector('.base-image-map-editor__panel')).toHaveClass('story-themed-panel')
	},
}
