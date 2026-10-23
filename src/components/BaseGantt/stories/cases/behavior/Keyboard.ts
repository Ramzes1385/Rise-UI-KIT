import type meta from '../../BaseGantt.stories'
import { expect, waitFor } from 'storybook/test'
import BaseGantt from '../../../ui/BaseGantt.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseGantt v-bind="args" />
`

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'scale'] },
		docs: {
			description: {
				story: [
					'Список слева — `treegrid` по APG, в Tab-порядке одна точка. Up и Down — по строкам, Home и End — к первой и последней, Left сворачивает этап',
					'или переходит к родителю, Right разворачивает этап или переходит на полосу, Enter и пробел сворачивают и разворачивают этап (на задаче без детей — `task-click`).',
					'На полосе: Up и Down — к полосе соседней строки, Left и Escape — назад к строке; при `isEditable` Left и Right двигают задачу, Shift со стрелками меняет длительность.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseGantt'] }),
		},
	},
	tags: ['!autodocs'],
	args: { isEditable: true, scale: 'day' },
	render: args => ({
		components: { BaseGantt },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const row = (name: string): HTMLElement => canvas.getByText(name).closest('[role="row"]') as HTMLElement
		await userEvent.tab()
		await expect(row('Дизайн')).toHaveFocus()
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(row('Исследование')).toHaveFocus())
		await userEvent.keyboard('{End}')
		await waitFor(() => expect(row('Запуск')).toHaveFocus())
		await userEvent.keyboard('{Home}')
		await waitFor(() => expect(row('Дизайн')).toHaveFocus())
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(row('Дизайн')).toHaveAttribute('aria-expanded', 'false'))
		await userEvent.keyboard(' ')
		await waitFor(() => expect(row('Дизайн')).toHaveAttribute('aria-expanded', 'true'))

		await userEvent.keyboard('{ArrowDown}{ArrowRight}')
		const bar = canvas.getByRole('button', { name: /^Исследование: / })
		await waitFor(() => expect(bar).toHaveFocus())
		await userEvent.keyboard('{ArrowRight}')
		await expect(args['onUpdate:task']).toHaveBeenLastCalledWith(
			expect.objectContaining({ id: 'research', start: '2025-05-06', end: '2025-05-09' }),
		)
		await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}')
		await expect(args['onTask-change']).toHaveBeenLastCalledWith(expect.objectContaining({ kind: 'resize-end', source: 'keyboard' }))
		await expect(canvas.getByRole('status')).toHaveTextContent('Длительность задачи «Исследование»')
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(canvas.getByRole('button', { name: /^Прототипы: / })).toHaveFocus())
		await userEvent.keyboard('{Enter}')
		await expect(args['onTask-click']).toHaveBeenCalledWith(expect.objectContaining({ id: 'wireframes' }), expect.anything())
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(row('Прототипы')).toHaveFocus())
	},
}
