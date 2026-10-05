import { expect } from 'storybook/test'
import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseMap v-bind="args" height="200px" aria-label="200px" />
		<BaseMap v-bind="args" height="40vh" aria-label="40vh" />
		<BaseMap v-bind="args" height="clamp(160px, 30vw, 320px)" variant="ghost" aria-label="clamp(160px, 30vw, 320px)" />
	</div>
`

export const Heights: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'`height` — любое CSS-значение: фиксированное, доля окна (`40vh`), адаптивное (`clamp(160px, 30vw, 320px)`); по умолчанию 400px,',
					'меньше `160px` карта не становится. Ширина — всегда 100 % контейнера: карта на всю ширину экрана — `ghost` без рамки и скругления (третья).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseMap'] }),
		},
		controls: { include: ['variant', 'sizeScale', 'zoom'] },
	},
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(getComputedStyle(canvas.getByRole('region', { name: '200px' })).height).toBe('200px')
		await expect(getComputedStyle(canvas.getByRole('region', { name: '40vh' })).height).toBe(
			`${Math.round(window.innerHeight * 0.4)}px`,
		)
		await expect(canvas.getByRole('region', { name: 'clamp(160px, 30vw, 320px)' })).toHaveClass('base-map--ghost')
	},
}
