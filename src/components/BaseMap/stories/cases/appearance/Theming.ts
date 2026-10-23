import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { expect, waitFor } from 'storybook/test'
import { OFFICES, liveOrDemo } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const color = { bg: { base: 'color-mix(in srgb, var(--rise-primary) 18%, var(--rise-bg))' }, text: { base: 'var(--rise-primary)' } }

const ui = { root: 'story-map-elevated', placeholder: 'story-map-striped' }

const template = `
	<div class="story-grid" style="--story-grid-min: 260px">
		<BaseMap v-bind="args" aria-label="По умолчанию" />
		<div style="--rise-map-radius: 24px; --rise-map-border: var(--rise-primary); --rise-map-bg: color-mix(in srgb, var(--rise-primary) 18%, var(--rise-bg)); --rise-map-marker-bg: var(--rise-error); --rise-map-tooltip-bg: var(--rise-primary); --rise-map-tooltip-text: var(--rise-text-inverted);">
			<BaseMap v-bind="args" aria-label="Токены на контейнере" />
		</div>
		<BaseMap v-bind="args" variant="outline" :color="color" aria-label="Проп color" />
		<BaseMap v-bind="args" :ui="ui" aria-label="Классы через ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'Перекраска без пропов и с ними. Токены компонента `--rise-map-*` кит только читает (запасное значение — прежний вид):',
					'`--rise-map-bg`, `--rise-map-text`, `--rise-map-border`, `--rise-map-radius` — подложка, текст, рамка и скругление области;',
					'`--rise-map-placeholder-padding` — отступ заглушки; `--rise-map-marker-bg`, `--rise-map-marker-border`, `--rise-map-marker-shadow` —',
					'метка без своего `color`; `--rise-map-tooltip-bg`, `--rise-map-tooltip-text`, `--rise-map-tooltip-radius` — подсказка метки.',
					'Задайте их в теме, на `:root` или на контейнере — как во второй карте; список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `color` красит подложку и текст заглушки (третья карта, с `outline`). Проп `ui` добавляет классы к частям `MAP_PARTS`',
					'(`root`, `canvas`, `placeholder`) — четвёртая карта: тень и ореол; глобально — `defaults.BaseMap.ui` плагина.',
					'Классы добавляются к классам кита, а не перебивают их. Цвет каждой метки — `color` в самой метке (`OFFICES`).',
					'С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMap'],
				script: `const markers = ${literal(OFFICES.slice(0, 2))}\n\nconst color = ${literal(color)}\n\nconst ui = ${literal(ui)}`,
			}),
			story: { inline: false, height: '520px' },
		},
		controls: { include: ['sizeScale', 'height', 'zoom'] },
	},
	args: { ...liveOrDemo.args, height: '200px', zoom: 12, markers: OFFICES.slice(0, 2) },
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { data: { color, ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('region', { name: 'По умолчанию' })
		const themed = canvas.getByRole('region', { name: 'Токены на контейнере' })
		const colored = canvas.getByRole('region', { name: 'Проп color' })
		const classed = canvas.getByRole('region', { name: 'Классы через ui' })
		const markerOf = (map: HTMLElement) => map.querySelector('.base-map__marker') as HTMLElement
		await waitFor(() => expect(markerOf(themed)).toBeInTheDocument())
		await waitFor(() => expect(markerOf(plain)).toBeInTheDocument())
		await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(markerOf(themed)).backgroundColor).not.toBe(getComputedStyle(markerOf(plain)).backgroundColor)
		await expect(getComputedStyle(colored).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(classed).toHaveClass('base-map', 'story-map-elevated')
		await expect(getComputedStyle(classed).boxShadow).not.toBe('none')
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('24px')
			await expect(getComputedStyle(classed).outlineWidth).toBe('4px')
		}
	},
}
