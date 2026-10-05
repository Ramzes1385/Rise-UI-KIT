import { expect } from 'storybook/test'
import type meta from '../../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-progress', fill: 'story-themed-fill' }

const template = `
	<div class="story-stack">
		<BaseProgress v-bind="args" has-label aria-label="По умолчанию" />
		<div style="--rise-progress-fill-bg: var(--rise-success); --rise-progress-track-bg: var(--rise-success-soft); --rise-progress-radius: var(--rise-radius-xs); --rise-progress-status-text: var(--rise-success-text); --rise-progress-font-size: var(--rise-font-size-xs);">
			<BaseProgress v-bind="args" has-label aria-label="Токены на контейнере" />
		</div>
		<BaseProgress v-bind="args" has-label :ui="ui" aria-label="Классы через ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['value', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-progress-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `height` (толщина полосы), `radius`, `gap` (подпись — полоса),',
					'`font-size` (подписи), `track-bg` (дорожка полосы и кольца), `fill-bg` (заливка; проп `color` сильнее), `status-text`',
					'(подпись над полосой), `circle-label-text` и `circle-label-font-weight` (подпись в кольце), `svg-width` (размер кольца).',
					'Проп `ui` добавляет классы к частям `root`, `status`, `status-text`, `track`, `bar`, `fill`, `svg`, `track-circle`,',
					'`fill-circle`, `circle-label`; глобально — `defaults.BaseProgress.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseProgress'],
				script: `const ui = ${literal(ui)}`,
				omit: ['default', 'hasLabel', 'ariaLabel'],
			}),
		},
	},
	render: args => ({
		components: { BaseProgress },
		setup: useStorySetup(args, { data: { ui }, slots: ['default', 'hasLabel', 'ariaLabel'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('progressbar', { name: 'По умолчанию' })
		const themed = canvas.getByRole('progressbar', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('progressbar', { name: 'Классы через ui' })
		const part = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`.base-progress__${name}`)!

		await expect(getComputedStyle(part(themed, 'fill')).backgroundColor).not.toBe(getComputedStyle(part(plain, 'fill')).backgroundColor)
		await expect(getComputedStyle(part(themed, 'track')).backgroundColor).not.toBe(
			getComputedStyle(part(plain, 'track')).backgroundColor,
		)
		if (!isStoryBranded()) await expect(getComputedStyle(part(themed, 'track')).borderTopLeftRadius).toBe('2px')
		if (!isStoryBranded()) await expect(getComputedStyle(part(plain, 'track')).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(part(themed, 'status')).color).not.toBe(getComputedStyle(part(plain, 'status')).color)
		await expect(classed).toHaveClass('base-progress', 'story-themed-progress')
		await expect(part(classed, 'fill')).toHaveClass('story-themed-fill')
	},
}
