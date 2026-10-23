import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDashboardGrid.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'

const template = `
	<BaseDashboardGrid v-bind="args">
		<template #empty>
			<p>Добавьте первый виджет, чтобы собрать панель.</p>
		</template>
	</BaseDashboardGrid>
`

export const Empty: StoryObj<typeof meta> = {
	args: { layout: [], isEditable: true },
	parameters: {
		docs: {
			description: {
				story: 'Без виджетов сетка показывает пустое состояние: стандартное («Нет виджетов») или своё через слот `empty`, как здесь.',
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
		await expect(canvas.getByText('Добавьте первый виджет, чтобы собрать панель.')).toBeVisible()
		await expect(canvas.queryByText('Нет виджетов')).toBeNull()
	},
}
