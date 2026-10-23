import { expect } from 'storybook/test'
import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCascader from '../../../ui/BaseCascader.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-cascader', trigger: 'story-themed-trigger', column: 'story-themed-column' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px; align-items: start;">
		<BaseCascader v-bind="args" label="По умолчанию" />
		<div style="--rise-cascader-bg: var(--rise-bg-muted); --rise-cascader-border: var(--rise-primary); --rise-cascader-radius: var(--rise-radius-2xl); --rise-cascader-padding-y: 12px; --rise-cascader-column-width: 240px;">
			<BaseCascader v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseCascader v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-cascader-*` кит только читает — задайте их на `:root`, в теме или на контейнере:',
					'поле — `bg`, `text`, `border`, `border-focus`, `radius`, `padding-x`, `padding-y`; панель — `column-width`,',
					'`option-bg-active`, `option-bg-open`, `option-font-weight-selected`, `checkbox-bg-checked` (список — docs/design/COMPONENT_TOKENS.md).',
					'Отступы панели умножаются на плотность темы `--rise-density`. Проп `ui` добавляет классы к частям (`root`, `trigger`,',
					'`panel`, `columns`, `column`, `option`… — `CASCADER_PARTS`); для всех полей приложения — `defaults.BaseCascader.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCascader'],
				script: `const ui = ${literal(ui)}`,
				omit: ['label', 'modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseCascader },
		setup: useStorySetup(args, { data: { ui }, slots: ['label', 'modelValue'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-cascader')]
		const trigger = (field: HTMLElement) => field.querySelector<HTMLElement>('.base-cascader__trigger')!

		await expect(getComputedStyle(trigger(themed)).backgroundColor).not.toBe(getComputedStyle(trigger(plain)).backgroundColor)
		await expect(getComputedStyle(trigger(themed)).borderTopColor).not.toBe(getComputedStyle(trigger(plain)).borderTopColor)
		if (!isStoryBranded()) await expect(getComputedStyle(trigger(themed)).borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(trigger(themed)).paddingTop).toBe('12px')
		await expect(classed).toHaveClass('base-cascader', 'story-themed-cascader')
		await expect(trigger(classed)).toHaveClass('base-cascader__trigger', 'story-themed-trigger')
	},
}
