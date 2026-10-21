import { expect } from 'storybook/test'
import type meta from '../../BaseTransfer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTransfer from '../../../ui/BaseTransfer.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-transfer', panel: 'story-themed-panel' }

const template = `
	<div class="story-stack">
		<BaseTransfer v-bind="args" label="По умолчанию" />
		<div style="--rise-transfer-panel-bg: var(--rise-bg-elevated); --rise-transfer-panel-border: var(--rise-primary); --rise-transfer-panel-radius: var(--rise-radius-2xl); --rise-transfer-panel-padding: 16px; --rise-transfer-title-text: var(--rise-primary-text);">
			<BaseTransfer v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseTransfer v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { height: 160 },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-transfer-*` кит только читает — задайте их на `:root`, в теме или на контейнере:',
					'`gap` между панелями; панель — `panel-bg`, `panel-border`, `panel-radius`, `panel-padding`, `panel-gap`; шапка —',
					'`title-text`, `title-font-weight`, `count-text` (список — docs/design/COMPONENT_TOKENS.md). Отступы умножаются на',
					'плотность темы `--rise-density`; строки списков — токены BaseList. Проп `ui` добавляет классы к частям (`root`, `panel`,',
					'`header`, `list`, `actions`… — `TRANSFER_PARTS`); для всех полей приложения — `defaults.BaseTransfer.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTransfer'],
				script: `const ui = ${literal(ui)}`,
				omit: ['label'],
			}),
		},
	},
	render: args => ({
		components: { BaseTransfer },
		setup: useStorySetup(args, { data: { ui }, slots: ['label'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-transfer')]
		const panel = (field: HTMLElement) => field.querySelector<HTMLElement>('.base-transfer__panel')!

		await expect(getComputedStyle(panel(themed)).backgroundColor).not.toBe(getComputedStyle(panel(plain)).backgroundColor)
		await expect(getComputedStyle(panel(themed)).borderTopColor).not.toBe(getComputedStyle(panel(plain)).borderTopColor)
		if (!isStoryBranded()) await expect(getComputedStyle(panel(themed)).borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(panel(themed)).paddingTop).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(panel(plain)).paddingTop).toBe('10px')
		await expect(classed).toHaveClass('base-transfer', 'story-themed-transfer')
		await expect(panel(classed)).toHaveClass('base-transfer__panel', 'story-themed-panel')
	},
}
