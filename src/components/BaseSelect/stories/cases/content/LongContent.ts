import { within, expect } from 'storybook/test'
import type meta from '../../BaseSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseSelectOption } from '../../../types/BaseSelect.types'

const PROJECTS: BaseSelectOption[] = [
	{ value: 'north', label: 'Сериал «Северный ветер», сезон 2, серии 1–12 — русский дубляж и субтитры' },
	{ value: 'fox', label: 'Аниме «Лисья тропа» — закадровый перевод' },
	{ value: 'lighthouse', label: 'Аудиокнига «Старый маяк»' },
]

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Длинное значение обрезается многоточием в триггере; в списке длинные названия переносятся.' } },
	},
	args: { label: 'Проект', options: PROJECTS, modelValue: 'north', placeholder: 'Выберите проект' },
	play: async ({ canvas }) => {
		const value = within(canvas.getByRole('combobox', { name: 'Проект' })).getByText(/Северный ветер/)
		await expect(value.scrollWidth).toBeGreaterThan(value.clientWidth)
	},
}
