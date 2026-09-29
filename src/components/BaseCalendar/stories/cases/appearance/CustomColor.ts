import { getDay } from '../../shared'
import { expect } from 'storybook/test'
import { storyDate } from '@/stories/helpers'
import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg.base`/`text.base` — поверхность и числа, `bg.hover` — наведение на день,',
					'`bg.active`/`text.active` — выбранный день. Кнопки навигации и «Сегодня» цвет не наследуют.',
				].join('\n'),
			},
		},
	},
	args: {
		modelValue: storyDate(0, 0, 0),
		color: {
			bg: { base: 'var(--rise-success-soft)', hover: 'var(--rise-success-soft-hover)', active: 'var(--rise-success)' },
			text: { base: 'var(--rise-success-text)', active: 'var(--rise-on-success)' },
		},
	},
	play: async ({ canvas }) => {
		const selected = getDay(canvas, 0)
		await expect(getComputedStyle(selected).backgroundColor).toBe(resolveColor('var(--rise-success)'))
		await expect(getComputedStyle(getDay(canvas, 1)).color).toBe(resolveColor('var(--rise-success-text)'))
		const calendar = selected.closest('.base-calendar') as HTMLElement
		await expect(getComputedStyle(calendar).backgroundColor).toBe(resolveColor('var(--rise-success-soft)'))
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Следующий месяц' })).backgroundColor).toBe('rgba(0, 0, 0, 0)')
	},
}
