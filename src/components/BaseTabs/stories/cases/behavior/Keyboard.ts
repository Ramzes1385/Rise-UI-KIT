import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseTabs.stories'
import { expect, waitFor } from 'storybook/test'
import { TABS_WITH_DISABLED } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура (APG Tabs): Tab попадает только на выбранную вкладку, → переносит фокус и выбор на следующую,',
					'End — на последнюю доступную (отключённая «Доставка» пропускается), Home — на первую. Enter на уже выбранной',
					'вкладке не эмитит `change`.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { items: TABS_WITH_DISABLED },
	play: async ({ canvas, userEvent, args }) => {
		const overview = canvas.getByRole('tab', { name: 'Обзор' })
		await tabTo(overview, userEvent)
		await expect(getComputedStyle(overview).outlineStyle).toBe('solid')
		await expect(canvas.getByRole('tab', { name: 'Характеристики' })).toHaveAttribute('tabindex', '-1')

		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('tab', { name: 'Характеристики' })).toHaveFocus()
		await expect(args.onChange).toHaveBeenLastCalledWith('specs')

		await userEvent.keyboard('{End}')
		await expect(canvas.getByRole('tab', { name: 'Отзывы' })).toHaveFocus()

		await userEvent.keyboard('{Home}')
		await expect(overview).toHaveFocus()
		await waitFor(() => expect(overview).toHaveAttribute('aria-selected', 'true'))

		const changes = (args.onChange as unknown as { mock: { calls: unknown[] } }).mock.calls.length
		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).toHaveBeenCalledTimes(changes)
	},
}
