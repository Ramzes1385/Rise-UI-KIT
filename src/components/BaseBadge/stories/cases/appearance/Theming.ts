import { expect } from 'storybook/test'
import type meta from '../../BaseBadge.stories'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-badge', text: 'story-themed-text' }

const template = `
	<div class="story-row">
		<BaseBadge v-bind="args" label="По умолчанию" />
		<div style="--rise-badge-bg: var(--rise-success); --rise-badge-text: var(--rise-on-success); --rise-badge-radius: var(--rise-radius-full); --rise-badge-padding-x: 10px; --rise-badge-font-weight: var(--rise-font-weight-bold);">
			<BaseBadge v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseBadge v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-badge-*` кит только читает: `bg`, `text` (заливка варианта `default`), `border`,',
					'`radius`, `shadow`, `padding-x`, `padding-y`, `gap`, `font-size`, `font-weight` — задайте их на `:root`, в теме или на',
					'контейнере, как здесь. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `text`); глобально — `defaults.BaseBadge.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBadge'],
				script: `const ui = ${literal(ui)}`,
				omit: ['label', 'variant', 'default'],
			}),
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup: useStorySetup(args, { data: { ui }, slots: ['label', 'default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const badge = (label: string) => canvas.getByText(label).closest('.base-badge') as HTMLElement
		const plain = badge('По умолчанию')
		const themed = badge('Токены на контейнере')
		const classed = badge('Классы через ui')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themed).paddingLeft).toBe('10px')
		await expect(getComputedStyle(plain).paddingLeft).toBe('7px')
		await expect(getComputedStyle(themed).fontWeight).toBe('700')
		await expect(classed).toHaveClass('base-badge', 'story-themed-badge')
		await expect(classed.querySelector('.base-badge__text')).toHaveClass('story-themed-text')
	},
}
