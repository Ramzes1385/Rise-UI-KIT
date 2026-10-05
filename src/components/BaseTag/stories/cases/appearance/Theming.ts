import { expect } from 'storybook/test'
import BaseTag from '../../../ui/BaseTag.vue'
import type meta from '../../BaseTag.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-tag', text: 'story-themed-text' }

const template = `
	<div class="story-row">
		<BaseTag v-bind="args" label="По умолчанию" />
		<div style="--rise-tag-bg: var(--rise-success-soft); --rise-tag-text: var(--rise-success-text); --rise-tag-border: var(--rise-success-border); --rise-tag-radius: var(--rise-radius-sm); --rise-tag-font-weight: var(--rise-font-weight-bold);">
			<BaseTag v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseTag v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { tone: 'neutral', isSelected: false },
	argTypes: { tone: { control: false } },
	parameters: {
		controls: { include: ['variant', 'isSelectable', 'isRemovable', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены компонента кит только читает: задайте их на `:root`, в теме или на контейнере — как здесь.',
					'Нейтральная метка: `--rise-tag-bg`, `--rise-tag-bg-hover`, `--rise-tag-text`, `--rise-tag-border`, выбранная —',
					'`--rise-tag-bg-selected`, `--rise-tag-text-selected` (цвета ролей `tone` задаёт палитра темы). Все метки: `--rise-tag-radius`,',
					'`--rise-tag-font-size`, `--rise-tag-font-weight`, `--rise-tag-padding-x`, `--rise-tag-padding-y`, `--rise-tag-gap`.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `main`, `icon`, `text`, `remove`);',
					'глобально — `defaults.BaseTag.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTag'], script: `const ui = ${literal(ui)}`, omit: ['label', 'tone'] }),
		},
	},
	render: args => ({
		components: { BaseTag },
		setup: useStorySetup(args, { data: { ui }, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByText('По умолчанию').closest('.base-tag')!
		const themed = canvas.getByText('Токены на контейнере').closest('.base-tag')!
		const classed = canvas.getByText('Классы через ui').closest('.base-tag')!

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('4px')
		await expect(getComputedStyle(plain).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themed).fontWeight).toBe('700')
		await expect(getComputedStyle(plain).fontWeight).toBe('500')
		await expect(classed).toHaveClass('base-tag', 'story-themed-tag')
		await expect(classed.querySelector('.base-tag__text')).toHaveClass('story-themed-text')
	},
}
