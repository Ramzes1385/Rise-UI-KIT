import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { LONG_LAYOUT, LONG_TEXT } from '../../shared'
import type meta from '../../BaseDashboardGrid.stories'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseDashboardGrid v-bind="args" :cols="2" :row-height="64">
			<template #item="{ item }">
				<strong>{{ item.label }}</strong>
				<p>{{ text }}</p>
			</template>
		</BaseDashboardGrid>
	</div>
`

export const LongContent: StoryObj<typeof meta> = {
	args: { layout: LONG_LAYOUT, isEditable: true },
	parameters: {
		docs: {
			description: {
				story: 'Длинный текст в узком контейнере переносится по словам; если он не помещается в клетки, виджет прокручивается внутри, а сетка не выходит за ширину контейнера.',
			},
			source: storySource({ template, imports: ['BaseDashboardGrid'], script: `const text = ${literal(LONG_TEXT)}` }),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args, { data: { text: LONG_TEXT } }),
		template,
	}),
	play: async ({ canvas }) => {
		const grid = canvas.getByRole('group', { name: 'Сетка виджетов' })
		const widget = canvas.getByRole('group', { name: /^Ежемесячный отчёт/ })
		const body = widget.querySelector('.base-dashboard-grid__body') as HTMLElement
		await expect(grid.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		await expect(grid.scrollWidth).toBeLessThanOrEqual(grid.clientWidth)
		await expect(getComputedStyle(body).overflowY).toBe('auto')
		await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
	},
}
