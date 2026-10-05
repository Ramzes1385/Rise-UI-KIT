import { expect } from 'storybook/test'
import type meta from '../../BaseSkeleton.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSkeleton from '../../../ui/BaseSkeleton.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-skeleton' }

const template = `
	<div class="story-stack">
		<BaseSkeleton v-bind="args" />
		<div style="--rise-skeleton-bg: var(--rise-primary-soft); --rise-skeleton-radius: var(--rise-radius-full); --rise-skeleton-height: var(--rise-line-height-xl);">
			<BaseSkeleton v-bind="args" />
		</div>
		<BaseSkeleton v-bind="args" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['shape', 'width', 'isAnimated', 'isPulse', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-skeleton-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `bg` (фон; проп `color` сильнее), `radius` (скругление `text`',
					'и `rect`; `circle` остаётся кругом), `height` (высота строки `text`; проп `height` сильнее). Проп `ui` добавляет',
					'классы к `root` — своих частей у скелетона нет; глобально — `defaults.BaseSkeleton.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSkeleton'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-skeleton')]

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themed).height).toBe('28px')
		await expect(getComputedStyle(plain).height).toBe('16px')
		await expect(classed).toHaveClass('base-skeleton', 'story-themed-skeleton')
	},
}
