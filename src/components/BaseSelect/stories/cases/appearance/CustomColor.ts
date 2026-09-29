import { GENRES } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseSelect.stories'
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
					'Кастомный цвет фона и текста триггера через `color`. Бейджи выбранных значений — вложенные компоненты:',
					'они цвет селекта не наследуют и остаются мягкими основного цвета.',
				].join('\n'),
			},
		},
	},
	args: {
		label: 'Жанры',
		options: GENRES,
		isMultiple: true,
		modelValue: ['drama', 'comedy'],
		color: { bg: { base: '#eff6ff' }, text: { base: '#1e3a8a' } },
	},
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Жанры' })
		await expect(getComputedStyle(trigger).backgroundColor).toBe('rgb(239, 246, 255)')
		const tag = canvas.getByText('Драма').closest('.base-badge') as HTMLElement
		await expect(getComputedStyle(tag).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
	},
}
