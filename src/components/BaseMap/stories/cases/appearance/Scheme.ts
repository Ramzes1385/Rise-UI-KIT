import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { OFFICES, liveOrDemo } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { MAP_SCHEMES } from '../../../types/BaseMap.types'
import { literal, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const markers = OFFICES.slice(0, 2)

const template = `
	<div class="story-grid" style="--story-grid-min: 260px">
		<BaseMap v-for="scheme in MAP_SCHEMES" :key="scheme" v-bind="args" :scheme="scheme" :markers="markers" :aria-label="scheme" />
	</div>
`

const demoScheme = (region: HTMLElement): string | undefined =>
	(region.querySelector('.story-demo-map') as HTMLElement | null)?.dataset.scheme

export const Scheme: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'`scheme` задаёт цветовую схему карты: `light` — светлая, `dark` — тёмная, `auto` (по умолчанию) — по теме кита:',
					'`data-theme` ближайшего предка или `<html>` (`system` — по `prefers-color-scheme`); смена темы подхватывается на лету.',
					'Яндекс переключает слой схемы на месте, Google пересоздаёт карту. Здесь три карты одной темы кита с разными схемами —',
					'переключатель «Тема» на панели меняет только `auto`. С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseMap', 'MAP_SCHEMES'], script: `const markers = ${literal(markers)}` }),
			story: { inline: false, height: '320px' },
		},
		controls: { include: ['sizeScale', 'height', 'zoom'] },
	},
	args: { ...liveOrDemo.args, height: '220px', zoom: 12 },
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { data: { MAP_SCHEMES, markers } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		for (const scheme of MAP_SCHEMES) {
			const region = canvas.getByRole('region', { name: scheme })
			await waitFor(() => expect(within(region).getByRole('button', { name: 'Красная площадь' })).toBeInTheDocument())
		}
		const light = canvas.getByRole('region', { name: 'light' })
		const dark = canvas.getByRole('region', { name: 'dark' })
		const auto = canvas.getByRole('region', { name: 'auto' })
		await userEvent.tab()
		await expect(within(light).getByRole('button', { name: 'Красная площадь' })).toHaveFocus()
		if (canvasElement.querySelector('.story-demo-map') === null) return
		await expect(demoScheme(light)).toBe('light')
		await expect(demoScheme(dark)).toBe('dark')
		await expect(['light', 'dark']).toContain(demoScheme(auto))
	},
}
