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

export const Disabled: StoryObj<typeof meta> = {
	args: { layout: SMALL_LAYOUT, isEditable: true, isDisabled: true },
	parameters: {
		docs: {
			description: {
				story: 'Отключённая сетка: виджеты на местах, ручек нет, фокус и перенос выключены, корень помечен `aria-disabled`.',
			},
			source: storySource({ template, imports: ['BaseDashboardGrid'] }),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('group', { name: 'Сетка виджетов' })).toHaveAttribute('aria-disabled', 'true')
		await userEvent.tab()
		await expect(canvas.getByRole('group', { name: 'Выручка' })).not.toHaveAttribute('tabindex')
		await expect(canvas.getByRole('group', { name: 'Выручка' })).not.toHaveFocus()
	},
}
