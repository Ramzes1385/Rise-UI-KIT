import { expect } from 'storybook/test'
import type meta from '../../BaseToolCall.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseToolCall from '../../../ui/BaseToolCall.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-tool-call', trigger: 'story-themed-trigger' }

const template = `
	<div class="story-stack story-medium">
		<BaseToolCall v-bind="args" title="По умолчанию" />
		<div style="--rise-tool-call-bg: var(--rise-bg-elevated); --rise-tool-call-border: var(--rise-primary); --rise-tool-call-radius: var(--rise-radius-2xl); --rise-tool-call-padding-x: 20px; --rise-tool-call-title-font-weight: var(--rise-font-weight-bold);">
			<BaseToolCall v-bind="args" title="Токены на контейнере" />
		</div>
		<BaseToolCall v-bind="args" title="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale', 'isOpen'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-tool-call-*` кит только читает: `bg`, `text`, `border` (рамка и линия над',
					'подробностями), `radius`, `padding-x` (заголовок и подробности), `trigger-padding-y`, `trigger-gap`, `trigger-bg-hover`,',
					'`title-font-weight`, `content-gap`, `code-bg`, `code-radius` — задайте их на `:root`, в теме или на контейнере, как здесь.',
					'Отступы умножаются на плотность темы `--rise-density`. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `trigger`, `status`, `title`, `name`, `state`, `arrow`, `collapse`, `content`,',
					'`code`, `error`); глобально — `defaults.BaseToolCall.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseToolCall'],
				script: `const ui = ${literal(ui)}`,
				omit: ['title', 'output', 'default'],
			}),
		},
	},
	render: args => ({
		components: { BaseToolCall },
		setup: useStorySetup(args, { data: { ui }, slots: ['output', 'default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const card = (title: string) =>
			canvas.getByRole('button', { name: new RegExp(`^${title}`) }).closest('.base-tool-call') as HTMLElement
		const plain = card('По умолчанию')
		const themed = card('Токены на контейнере')
		const classed = card('Классы через ui')
		const trigger = (element: HTMLElement) => element.querySelector('.base-tool-call__trigger') as HTMLElement

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(trigger(themed)).paddingInlineStart).toBe('20px')
		if (!isStoryBranded()) await expect(getComputedStyle(trigger(plain)).paddingInlineStart).toBe('12px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed.querySelector('.base-tool-call__title')!).fontWeight).toBe('700')
		await expect(classed).toHaveClass('base-tool-call', 'story-themed-tool-call')
		await expect(trigger(classed)).toHaveClass('story-themed-trigger')
	},
}
