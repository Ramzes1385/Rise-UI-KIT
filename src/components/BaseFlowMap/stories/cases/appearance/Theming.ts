import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseFlowMap v-bind="args" aria-label="Тема по умолчанию" height="440px" :panels="['toolbar']" />
		<div style="--rise-flow-map-node-bg: var(--rise-primary-soft); --rise-flow-map-node-border: var(--rise-primary); --rise-flow-map-node-radius: var(--rise-radius-xs); --rise-flow-map-edge-border: var(--rise-primary); --rise-flow-map-canvas-bg: var(--rise-bg)">
			<BaseFlowMap v-bind="args" aria-label="Токены на контейнере" height="440px" :panels="['toolbar']" />
		</div>
		<div data-theme="dark" style="padding: 12px; background-color: var(--rise-bg)">
			<BaseFlowMap v-bind="args" aria-label="Тёмная тема" height="440px" :panels="['toolbar']" />
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: карта «по умолчанию», «токены на контейнере» и карта в тёмной области (`data-theme="dark"` на обёртке — одна карта в светлой странице).',
					'Токены `--rise-flow-map-*` кит только читает — задайте их на `:root`, в теме или на контейнере: `canvas-bg`, `node-bg`, `node-border`, `node-border-selected`,',
					'`node-radius`, `node-shadow`, `edge-border`, `edge-async-border`, `group-bg`, `group-border`, `label-text`, `toolbar-bg`, `minimap-bg`, `legend-bg`.',
					'Цвета статусов, фокуса и выделения берутся из токенов темы (`--rise-success`, `--rise-warning`, `--rise-focus-ring`) и держат контраст в обеих темах.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'], omit: ['height', 'panels'] }),
		},
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('region', { name: 'Тема по умолчанию' })
		const themed = canvas.getByRole('region', { name: 'Токены на контейнере' })
		const dark = canvas.getByRole('region', { name: 'Тёмная тема' })
		const node = (root: HTMLElement) => root.querySelector<HTMLElement>('.base-flow-map__node')!
		await expect(getComputedStyle(node(themed)).backgroundColor).not.toBe(getComputedStyle(node(plain)).backgroundColor)
		await expect(getComputedStyle(node(themed)).borderTopColor).not.toBe(getComputedStyle(node(plain)).borderTopColor)
		await expect(dark.closest('[data-theme="dark"]')).not.toBeNull()
	},
}
