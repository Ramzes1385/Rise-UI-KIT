import { expect } from 'storybook/test'
import type meta from '../../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSeparator from '../../../ui/BaseSeparator.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-separator', line: 'story-themed-line', content: 'story-themed-content' }

const template = `
	<div class="story-stack">
		<BaseSeparator v-bind="args" label="По умолчанию" />
		<div style="--rise-separator-border: var(--rise-primary); --rise-separator-content-text: var(--rise-primary-text); --rise-separator-content-font-size: var(--rise-font-size-sm); --rise-separator-content-font-weight: var(--rise-font-weight-bold);">
			<BaseSeparator v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseSeparator v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['isDashed', 'thickness', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-separator-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `border` (цвет линии; проп `color` сильнее), подпись —',
					'`content-text`, `content-font-size`, `content-font-weight`, `content-padding-x` и `content-padding-y` (проп `spacing` сильнее).',
					'Проп `ui` добавляет классы к частям `root`, `line` (обе линии) и `content`; глобально — `defaults.BaseSeparator.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSeparator'],
				script: `const ui = ${literal(ui)}`,
				omit: ['orientation', 'label', 'default'],
			}),
		},
	},
	render: args => ({
		components: { BaseSeparator },
		setup: useStorySetup(args, { data: { ui }, slots: ['orientation', 'label', 'default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('separator', { name: 'По умолчанию' })
		const themed = canvas.getByRole('separator', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('separator', { name: 'Классы через ui' })
		const part = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`.base-separator__${name}`)!

		await expect(getComputedStyle(part(themed, 'line')).borderTopColor).not.toBe(getComputedStyle(part(plain, 'line')).borderTopColor)
		await expect(getComputedStyle(part(themed, 'content')).color).not.toBe(getComputedStyle(part(plain, 'content')).color)
		await expect(getComputedStyle(part(themed, 'content')).fontWeight).toBe('700')
		await expect(getComputedStyle(part(plain, 'content')).fontWeight).toBe('400')
		await expect(classed).toHaveClass('base-separator', 'story-themed-separator')
		await expect(classed.querySelectorAll('.story-themed-line')).toHaveLength(2)
		await expect(part(classed, 'content')).toHaveClass('story-themed-content')
	},
}
