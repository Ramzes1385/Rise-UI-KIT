import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageCompare.stories'
import BaseImageCompare from '../../../ui/BaseImageCompare.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-compare', handle: 'story-themed-handle' }

const template = `
	<div class="story-stack" style="max-width: 560px">
		<BaseImageCompare v-bind="args" before-label="По умолчанию" />
		<div style="--rise-image-compare-radius: var(--rise-radius-2xl); --rise-image-compare-border: var(--rise-primary); --rise-image-compare-label-bg: var(--rise-primary); --rise-image-compare-divider-width: 4px; --rise-image-compare-handle-bg: var(--rise-primary); --rise-image-compare-handle-text: var(--rise-text-inverted);">
			<BaseImageCompare v-bind="args" before-label="Токены на контейнере" />
		</div>
		<BaseImageCompare v-bind="args" before-label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-image-compare-*` кит только читает — задайте их на `:root`, в теме или на контейнере:',
					'`bg`, `border`, `radius`; подписи — `label-bg`, `label-text`, `label-radius`, `label-font-weight`; граница — `divider-bg`,',
					'`divider-width`; ручка — `handle-bg`, `handle-text`, `handle-shadow` (список — docs/design/COMPONENT_TOKENS.md). Цвета поверх',
					'картинок по умолчанию — медиа-токены `--rise-media-*`, одинаковые в светлой и тёмной теме. Проп `ui` добавляет классы к частям',
					'(`root`, `image`, `before`, `label`, `track`, `divider`, `handle` — `IMAGE_COMPARE_PARTS`); для всех сравнений приложения —',
					'`defaults.BaseImageCompare.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImageCompare'],
				script: `const ui = ${literal(ui)}`,
				omit: ['beforeLabel'],
			}),
		},
	},
	render: args => ({
		components: { BaseImageCompare },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-image-compare')]
		const part = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`.base-image-compare__${name}`)!

		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(part(themed, 'label')).backgroundColor).not.toBe(
			getComputedStyle(part(plain, 'label')).backgroundColor,
		)
		await expect(getComputedStyle(part(themed, 'handle')).backgroundColor).not.toBe(
			getComputedStyle(part(plain, 'handle')).backgroundColor,
		)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
			await expect(getComputedStyle(plain).borderTopLeftRadius).toBe('8px')
			await expect(getComputedStyle(part(themed, 'divider')).width).toBe('4px')
		}
		await expect(classed).toHaveClass('base-image-compare', 'story-themed-compare')
		await expect(part(classed, 'handle')).toHaveClass('base-image-compare__handle', 'story-themed-handle')
	},
}
