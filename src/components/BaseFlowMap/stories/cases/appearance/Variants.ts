import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { FLOW_MAP_VARIANTS } from '../../../types/BaseFlowMap.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = [...FLOW_MAP_VARIANTS]

const template = `
	<div class="story-stack">
		<div v-for="item in variants" :key="item">
			<span class="story-label">{{ item }}</span>
			<BaseFlowMap v-bind="args" :variant="item" :aria-label="'Карта: ' + item" height="320px" :panels="['toolbar']" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled'] },
		docs: {
			description: {
				story: 'Варианты оформления `variant`: `default` — рамка и фон холста, `outline` — только контур, `ghost` — без рамки и фона. Одна и та же карта, панель — только масштаб.',
			},
			source: storySource({
				template,
				imports: ['BaseFlowMap'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant', 'height', 'panels'],
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
	play: async ({ canvas }) => {
		for (const variant of variants) await expect(canvas.getByRole('region', { name: `Карта: ${variant}` })).toBeVisible()
		await expect(canvas.getByRole('region', { name: 'Карта: outline' })).toHaveClass('base-flow-map--outline')
		await expect(canvas.getByRole('region', { name: 'Карта: ghost' })).toHaveClass('base-flow-map--ghost')
	},
}
