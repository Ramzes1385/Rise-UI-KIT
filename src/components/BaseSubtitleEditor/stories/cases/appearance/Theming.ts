import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseSubtitleEditor.stories'
import BaseSubtitleEditor from '../../../ui/BaseSubtitleEditor.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-subtitles', row: 'story-themed-row' }

const template = `
	<div class="story-stack">
		<BaseSubtitleEditor v-bind="args" />
		<div style="--rise-subtitle-editor-bg: var(--rise-bg-elevated); --rise-subtitle-editor-border: var(--rise-primary); --rise-subtitle-editor-radius: var(--rise-radius-2xl); --rise-subtitle-editor-padding: 20px; --rise-subtitle-editor-timeline-height: 36px; --rise-subtitle-editor-row-bg-active: var(--rise-bg-accented);">
			<BaseSubtitleEditor v-bind="args" />
		</div>
		<BaseSubtitleEditor v-bind="args" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Три редактора: по умолчанию, с токенами на контейнере и с классами через `ui`. Токены `--rise-subtitle-editor-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `bg`, `text`, `border`, `radius`, `padding`, `gap`; шкала —',
					'`timeline-bg`, `timeline-height`; реплика на шкале — `block-bg`, `block-bg-active`; строка — `row-radius`, `row-bg-active`',
					'(список — docs/design/COMPONENT_TOKENS.md). Отступы панели и списка умножаются на плотность темы `--rise-density`. Проп `ui`',
					'добавляет классы к частям (`root`, `toolbar`, `timeline`, `list`, `row`, `text`… — `SUBTITLE_EDITOR_PARTS`); для всех',
					'редакторов приложения — `defaults.BaseSubtitleEditor.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSubtitleEditor'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseSubtitleEditor },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-subtitle-editor')]
		const activeRow = (root: HTMLElement) => root.querySelector<HTMLElement>('.base-subtitle-editor__row--active')!

		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(activeRow(themed)).backgroundColor).not.toBe(getComputedStyle(activeRow(plain)).backgroundColor)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
			await expect(getComputedStyle(plain).borderTopLeftRadius).toBe('8px')
			await expect(getComputedStyle(themed).paddingTop).toBe('20px')
			await expect(getComputedStyle(plain).paddingTop).toBe('12px')
		}
		await expect(classed).toHaveClass('base-subtitle-editor', 'story-themed-subtitles')
		await expect(activeRow(classed)).toHaveClass('base-subtitle-editor__row', 'story-themed-row')
	},
}
