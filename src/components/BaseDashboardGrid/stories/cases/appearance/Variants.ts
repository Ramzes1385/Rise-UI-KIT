import { expect } from 'storybook/test'
import { SMALL_LAYOUT } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDashboardGrid.stories'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { DASHBOARD_GRID_VARIANTS } from '../../../types/BaseDashboardGrid.types'

const template = `
	<div class="story-stack">
		<div v-for="variant in DASHBOARD_GRID_VARIANTS" :key="variant">
			<p class="story-label">{{ variant }}</p>
			<BaseDashboardGrid v-bind="args" :variant="variant" :layout="layout" :cols="4" :row-height="48" :aria-label="'Вариант ' + variant">
				<template #item="{ item }">
					<strong>{{ item.label }}</strong>
				</template>
			</BaseDashboardGrid>
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	args: { layout: SMALL_LAYOUT },
	parameters: {
		controls: { include: ['sizeScale', 'isEditable'] },
		docs: {
			description: {
				story: 'Варианты карточек: `default` — рамка и фон, `soft` — мягкий фон без рамки, `outline` — прозрачная карточка с выраженной рамкой.',
			},
			source: storySource({
				template,
				imports: ['BaseDashboardGrid', 'DASHBOARD_GRID_VARIANTS'],
				script: `const layout = ${literal(SMALL_LAYOUT)}`,
				omit: ['layout'],
			}),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args, { data: { DASHBOARD_GRID_VARIANTS, layout: SMALL_LAYOUT } }),
		template,
	}),
	play: async ({ canvas }) => {
		for (const variant of DASHBOARD_GRID_VARIANTS) {
			await expect(canvas.getByRole('group', { name: `Вариант ${variant}` })).toBeVisible()
		}
		await expect(canvas.getByRole('group', { name: 'Вариант soft' })).toHaveClass('base-dashboard-grid--soft')
		await expect(canvas.getByRole('group', { name: 'Вариант outline' })).toHaveClass('base-dashboard-grid--outline')
	},
}
