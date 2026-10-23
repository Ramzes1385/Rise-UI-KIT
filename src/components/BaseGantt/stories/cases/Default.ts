import type meta from '../BaseGantt.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: проект из десяти задач с деревом, зависимостями, вехой и линией «сегодня» (15 мая 2025). Меняйте props в Controls.',
					'Tab ставит фокус на список; стрелки ходят по строкам, Left и Right сворачивают и разворачивают этап, Right на задаче переходит на её полосу.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('treegrid', { name: 'Диаграмма Ганта' })).toHaveAttribute('aria-rowcount', '11')
		await expect(canvas.getByRole('button', { name: /^Запуск: .*веха$/ })).toBeVisible()
		await userEvent.tab()
		const design = canvas.getByText('Дизайн').closest('[role="row"]') as HTMLElement
		await expect(design).toHaveFocus()
		await userEvent.keyboard('{ArrowLeft}')
		await waitFor(() => expect(design).toHaveAttribute('aria-expanded', 'false'))
		await expect(canvas.queryByText('Исследование')).not.toBeInTheDocument()
		await expect(args['onUpdate:collapsedIds']).toHaveBeenLastCalledWith(['design'])
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(design).toHaveAttribute('aria-expanded', 'true'))
		await expect(canvas.getByText('Исследование')).toBeVisible()
	},
}
