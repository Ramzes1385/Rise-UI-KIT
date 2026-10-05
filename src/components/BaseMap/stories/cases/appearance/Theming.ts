import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { expect, waitFor } from 'storybook/test'
import { OFFICES, liveOrDemo } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const color = { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary)' } }

const customClass = { root: 'story-map-elevated', placeholder: 'story-map-striped' }

const template = `
	<div class="story-grid" style="--story-grid-min: 260px">
		<BaseMap v-bind="args" aria-label="По умолчанию" />
		<div style="--rise-radius-lg: 24px; --rise-border: var(--rise-primary); --rise-primary: var(--rise-error); --rise-bg-muted: var(--rise-primary-soft);">
			<BaseMap v-bind="args" aria-label="Токены на контейнере" />
		</div>
		<BaseMap v-bind="args" variant="outline" :color="color" aria-label="Проп color" />
		<BaseMap v-bind="args" :custom-class="customClass" aria-label="Классы customClass" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'Перекраска без пропов и с ними. Карта читает токены темы: `--rise-border` и `--rise-radius-lg` — рамка и скругление, `--rise-bg-muted` — фон',
					'заглушки и подложки, `--rise-primary` — цвет меток без своего `color`, `--rise-shadow-sm` — тень метки, `--rise-bg-inverted` — подсказка метки.',
					'Задайте их в теме, на `:root` или на контейнере — как во второй карте. Проп `color` красит подложку и текст заглушки (третья карта, с `outline`),',
					'`customClass` вешает классы на части `root`, `canvas`, `placeholder` (четвёртая: тень и ореол, полосатая заглушка). Классы добавляются к классам кита,',
					'а не перебивают их: рамку, скругление и фон меняйте токенами, классами — то, чего кит не задаёт (тень, ореол, отступы).',
					'Цвет каждой метки — `color` в самой метке (`OFFICES`). С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMap'],
				script: `const markers = ${literal(OFFICES.slice(0, 2))}\n\nconst color = ${literal(color)}\n\nconst customClass = ${literal(customClass)}`,
			}),
			story: { inline: false, height: '520px' },
		},
		controls: { include: ['sizeScale', 'height', 'zoom'] },
	},
	args: { ...liveOrDemo.args, height: '200px', zoom: 12, markers: OFFICES.slice(0, 2) },
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { data: { color, customClass } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('region', { name: 'По умолчанию' })
		const themed = canvas.getByRole('region', { name: 'Токены на контейнере' })
		const colored = canvas.getByRole('region', { name: 'Проп color' })
		const classed = canvas.getByRole('region', { name: 'Классы customClass' })
		const markerOf = (map: HTMLElement) => map.querySelector('.base-map__marker') as HTMLElement
		await waitFor(() => expect(markerOf(themed)).toBeInTheDocument())
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('24px')
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(markerOf(themed)).backgroundColor).not.toBe(getComputedStyle(markerOf(plain)).backgroundColor)
		await expect(getComputedStyle(colored).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(classed).toHaveClass('base-map', 'story-map-elevated')
		await expect(getComputedStyle(classed).boxShadow).not.toBe('none')
		await expect(getComputedStyle(classed).outlineWidth).toBe('4px')
	},
}
