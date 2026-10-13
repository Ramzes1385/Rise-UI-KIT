import { expect } from 'storybook/test'
import { RESPONSIVE_LAYOUTS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDashboardGrid.stories'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const models = { layouts: 'layouts' }

const views = [
	{ name: 'lg', label: 'Широкая сетка (640 px): раскладка lg, 12 колонок', width: '640px' },
	{ name: 'md', label: 'Средняя (440 px): раскладка md, 6 колонок', width: '440px' },
	{ name: 'sm', label: 'Узкая (300 px): раскладка sm, 2 колонки', width: '300px' },
]

const cols = { lg: 12, md: 6, sm: 2 }

const breakpoints = { sm: 0, md: 400, lg: 600 }

const template = `
	<div class="story-stack">
		<div v-for="view in views" :key="view.name">
			<p class="story-label">{{ view.label }}</p>
			<div :style="{ width: view.width, maxWidth: '100%' }">
				<BaseDashboardGrid
					v-bind="args"
					v-model:layouts="layouts"
					:cols="cols"
					:breakpoints="breakpoints"
					:row-height="48"
					:gap="8"
					:aria-label="'Сетка ' + view.name">
					<template #item="{ item }">
						<strong>{{ item.label }}</strong>
					</template>
				</BaseDashboardGrid>
			</div>
		</div>
	</div>
`

const script = `const views = ${literal(views)}\n\nconst cols = ${literal(cols)}\n\nconst breakpoints = ${literal(breakpoints)}`

export const Responsive: StoryObj<typeof meta> = {
	args: { layouts: RESPONSIVE_LAYOUTS, isEditable: true },
	parameters: {
		controls: { include: ['isEditable', 'compactType', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'`layouts` хранит раскладку для каждого брейкпоинта (`sm`, `md`, `lg`); сетка выбирает её по своей ширине, а не по ширине окна.',
					'Здесь одна и та же `v-model:layouts` показана в трёх контейнерах: правка в одном меняет раскладку своего брейкпоинта и не трогает остальные.',
					'Брейкпоинту без раскладки достаётся ближайшая шире, подогнанная под его число колонок (`cols` принимает объект).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDashboardGrid'], models, script, omit: ['layout'] }),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args, { models, data: { views, cols, breakpoints } }),
		template,
	}),
	play: async ({ canvas }) => {
		const grids = canvas.getAllByRole('group', { name: /^Сетка (lg|md|sm)$/ })
		await expect(grids).toHaveLength(3)
		const [wide, medium, narrow] = grids.map(grid => grid.getBoundingClientRect().height)
		await expect(medium).toBeGreaterThan(wide)
		await expect(narrow).toBeGreaterThan(medium)
	},
}
