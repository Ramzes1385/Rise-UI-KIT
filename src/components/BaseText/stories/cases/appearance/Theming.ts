import { expect } from 'storybook/test'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-text' }

const template = `
	<div class="story-stack">
		<BaseText v-bind="args">По умолчанию</BaseText>
		<div style="--rise-text-text: var(--rise-text-muted); --rise-text-font-size: var(--rise-font-size-base); --rise-text-font-weight: var(--rise-font-weight-medium);">
			<BaseText v-bind="args">Токены на контейнере</BaseText>
		</div>
		<BaseText v-bind="args" :ui="ui">Классы через ui</BaseText>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	argTypes: { weight: { control: false } },
	parameters: {
		controls: { include: ['tag', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены компонента `--rise-text-text` (цвет), `--rise-text-font-size` (кегль) и',
					'`--rise-text-font-weight` (начертание при `weight` по умолчанию; явный `weight` сильнее токена) кит только читает:',
					'задайте их на `:root`, в теме или на контейнере — как здесь. Они действуют и на BaseText внутри других компонентов.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к `root`; глобально — `defaults.BaseText.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseText'], script: `const ui = ${literal(ui)}`, omit: ['default', 'weight'] }),
		},
	},
	render: args => ({
		components: { BaseText },
		setup: useStorySetup(args, { data: { ui }, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByText('По умолчанию')
		const themed = canvas.getByText('Токены на контейнере')
		const classed = canvas.getByText('Классы через ui')

		await expect(getComputedStyle(themed).color).not.toBe(getComputedStyle(plain).color)
		await expect(getComputedStyle(themed).fontSize).toBe('16px')
		await expect(getComputedStyle(plain).fontSize).toBe('14px')
		await expect(getComputedStyle(themed).fontWeight).toBe('500')
		await expect(getComputedStyle(plain).fontWeight).toBe('400')
		await expect(classed).toHaveClass('base-text', 'story-themed-text')
	},
}
