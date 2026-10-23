import { expect } from 'storybook/test'
import { SMALL_LAYOUT } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDashboardGrid.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'

const template = `
	<BaseDashboardGrid v-bind="args" :cols="4" :row-height="48">
		<template #item="{ item }">
			<strong>{{ item.label }}</strong>
		</template>
	</BaseDashboardGrid>
`

export const CustomColor: StoryObj<typeof meta> = {
	args: { layout: SMALL_LAYOUT, color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color`: заливка карточек и цвет текста. Цвет не протекает во вложенные компоненты внутри виджетов.',
			},
			source: storySource({ template, imports: ['BaseDashboardGrid'] }),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const widget = canvas.getByRole('group', { name: 'Выручка' })
		await expect(getComputedStyle(widget).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(widget).color).toBe('rgb(255, 255, 255)')
	},
}
