import { expect } from 'storybook/test'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap from '../../../ui/BaseImageMap.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-map', viewport: 'story-themed-viewport', marker: 'story-themed-marker' }

const template = `
	<div class="story-stack story-medium">
		<BaseImageMap v-bind="args" />
		<div style="--rise-image-map-bg: var(--rise-bg-elevated); --rise-image-map-border: var(--rise-primary); --rise-image-map-radius: var(--rise-radius-2xl); --rise-image-map-padding: 16px; --rise-image-map-viewport-radius: var(--rise-radius-xl);">
			<BaseImageMap v-bind="args" />
		</div>
		<BaseImageMap v-bind="args" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-image-map-*` кит только читает — задайте их на `:root`, в теме или на контейнере:',
					'`bg`, `text`, `border`, `radius`, `padding`, `gap`; окно карты — `viewport-bg`, `viewport-radius`; подпись точки — `label-bg`;',
					'подсказка про колесо мыши — `hint-bg`, `hint-text` (поверх плана, по умолчанию — инверсные `--rise-bg-inverted` и `--rise-text-inverted`);',
					'список объектов — `entry-radius`, `entry-bg-hover`, `entry-bg-active`, `entry-border-active`; шаги маршрута — `route-step-radius`,',
					'`route-step-bg-hover` (список — docs/design/COMPONENT_TOKENS.md). Отступы карты и списков умножаются на плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к частям (`root`, `toolbar`, `viewport`, `stage`, `point`, `marker`, `legend`, `tooltip`… — `IMAGE_MAP_PARTS`);',
					'у списка объектов — `directory`, `search`, `filters`, `results`, `list`, `entry`, у панели «Как пройти» — `route`, `route-steps`, `route-step`;',
					'для всех карт приложения — `defaults.BaseImageMap.ui` плагина.',
					'Одинаковые экземпляры для сравнения — регионы с одним именем, поэтому правило axe `landmark-unique` у этой истории выключено.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImageMap'],
				script: `const ui = ${literal(ui)}`,
			}),
		},
	},
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = Array.from(canvasElement.querySelectorAll<HTMLElement>('.base-image-map'))
		const viewport = (map: HTMLElement) => map.querySelector<HTMLElement>('.base-image-map__viewport')!

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		if (!isStoryBranded())
			await expect(getComputedStyle(viewport(themed)).borderTopLeftRadius).not.toBe(
				getComputedStyle(viewport(plain)).borderTopLeftRadius,
			)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
			await expect(getComputedStyle(themed).paddingTop).toBe('16px')
			await expect(getComputedStyle(plain).paddingTop).toBe('8px')
		}
		await expect(classed).toHaveClass('base-image-map', 'story-themed-map')
		await expect(viewport(classed)).toHaveClass('base-image-map__viewport', 'story-themed-viewport')
		await expect(classed.querySelector('.base-image-map__marker')).toHaveClass('story-themed-marker')
	},
}
