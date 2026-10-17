import { expect } from 'storybook/test'
import { WIDGET_LAYOUT } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDashboardGrid.stories'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'
import { storySource, tabTo, useStorySetup, inlineKey } from '@/stories/helpers'

const state = { layout: WIDGET_LAYOUT }

const template = `
	<BaseDashboardGrid v-bind="args" v-model:layout="layout">
		<template #item="{ item, isGrabbed }">
			<strong>{{ item.label }}</strong>
			<p>{{ isGrabbed ? 'Взят' : item.w + ' × ' + item.h }}</p>
		</template>
	</BaseDashboardGrid>
`

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	args: { isEditable: true },
	parameters: {
		controls: { include: ['compactType'] },
		docs: {
			description: {
				story: [
					'Клавиатура: Tab переводит на виджет, Enter или пробел берёт его, стрелки двигают, Shift со стрелками меняют размер,',
					'Enter кладёт, Escape отменяет. Каждый шаг объявляется в `role="status"`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDashboardGrid'], state }),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const widget = canvas.getByRole('group', { name: 'Выручка' })
		const status = canvas.getByRole('status')
		await tabTo(widget, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(status).toHaveTextContent('Виджет «Выручка» взят')
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await expect(status).toHaveTextContent('«Выручка»: колонка 2, строка 1, ширина 4, высота 2')

		await userEvent.keyboard('{Escape}')
		await expect(status).toHaveTextContent('Перемещение отменено, виджет «Выручка» на прежнем месте')
		await expect(args.onChange).not.toHaveBeenCalled()

		await userEvent.keyboard('{Enter}' + inlineKey('{ArrowRight}') + '{Enter}')
		await expect(status).toHaveTextContent('Виджет «Выручка» положен: колонка 2, строка 1')
		await expect(args.onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'revenue', action: 'move' }))

		await userEvent.keyboard('{Enter}{Shift>}' + inlineKey('{ArrowRight}') + '{/Shift}')
		await expect(status).toHaveTextContent('ширина 5')
		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'revenue', action: 'resize' }))
		await expect(widget).toHaveFocus()
	},
}
