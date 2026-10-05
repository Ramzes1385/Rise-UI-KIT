import { expect } from 'storybook/test'
import type meta from '../../BaseButton.stories'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-button', label: 'story-themed-label' }

const template = `
	<div class="story-row">
		<BaseButton v-bind="args">По умолчанию</BaseButton>
		<div style="--rise-button-bg: var(--rise-success); --rise-button-bg-hover: var(--rise-success-hover); --rise-button-radius: var(--rise-radius-full); --rise-button-font-weight: var(--rise-font-weight-bold);">
			<BaseButton v-bind="args">Токены на контейнере</BaseButton>
		</div>
		<BaseButton v-bind="args" :ui="ui">Классы через ui</BaseButton>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены компонента `--rise-button-*` (фон, текст, рамка, радиус, тень, отступы, начертание)',
					'кит только читает: задайте их на `:root`, в теме или на контейнере — как здесь. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `content`, `label`, `slot-left`, `slot-right`, `loader`) — для утилитарного CSS;',
					'глобально — `defaults.BaseButton.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseButton'], script: `const ui = ${literal(ui)}`, omit: ['variant'] }),
		},
	},
	render: args => ({
		components: { BaseButton },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('button', { name: 'По умолчанию' })
		const themed = canvas.getByRole('button', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('button', { name: 'Классы через ui' })

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themed).fontWeight).toBe('700')
		await expect(getComputedStyle(plain).fontWeight).toBe('500')
		await expect(classed).toHaveClass('base-button', 'story-themed-button')
		await expect(classed.querySelector('.base-button__label')).toHaveClass('story-themed-label')
	},
}
