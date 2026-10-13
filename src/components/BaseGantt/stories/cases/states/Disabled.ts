import { expect } from 'storybook/test'
import type meta from '../../BaseGantt.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`isDisabled`: диаграмма только для просмотра — строки выходят из Tab-порядка, клики по полосам и названиям и стрелка раскрытия не работают,',
					'перетаскивание и клавиши правки отключены даже при `isEditable` (таблица получает `aria-disabled`).',
				].join('\n'),
			},
		},
	},
	args: { isDisabled: true, isEditable: true, height: 320 },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('treegrid')).toHaveAttribute('aria-disabled', 'true')
		await userEvent.tab()
		await expect(canvas.getByText('Дизайн').closest('[role="row"]')).not.toHaveFocus()
		await userEvent.click(canvas.getByRole('button', { name: /^Исследование: / }))
		await userEvent.click(canvas.getByText('Прототипы'))
		await expect(args['onTask-click']).not.toHaveBeenCalled()
		await expect(args['onUpdate:task']).not.toHaveBeenCalled()
	},
}
