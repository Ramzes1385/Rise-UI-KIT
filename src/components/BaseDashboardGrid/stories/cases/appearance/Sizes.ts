import { expect } from 'storybook/test'
import { SMALL_LAYOUT } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDashboardGrid.stories'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name">
			<p class="story-label">{{ preset.label }}</p>
			<BaseDashboardGrid
				v-bind="args"
				:size-scale="preset.sizeScale"
				:layout="layout"
				:cols="4"
				:row-height="40"
				:gap="8"
				:label="'Размер ' + preset.name">
				<template #item="{ item }">
					<strong>{{ item.label }}</strong>
				</template>
			</BaseDashboardGrid>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	args: { layout: SMALL_LAYOUT },
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: высота строки, промежутки, отступы, текст и скругления масштабируются вместе.',
			},
			source: storySource({
				template,
				imports: ['BaseDashboardGrid'],
				script: `const presets = ${literal(presets)}\n\nconst layout = ${literal(SMALL_LAYOUT)}`,
				omit: ['layout'],
			}),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args, { data: { presets, layout: SMALL_LAYOUT } }),
		template,
	}),
	play: async ({ canvas }) => {
		const grids = canvas.getAllByRole('group', { name: /^Размер / })
		await expect(grids).toHaveLength(presets.length)
		const heights = grids.map(grid => grid.getBoundingClientRect().height)
		for (let index = 1; index < heights.length; index++) await expect(heights[index]).toBeGreaterThan(heights[index - 1])
	},
}
