import { docsFrame } from '../../shared'
import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor, within } from 'storybook/test'
import type { BaseCascaderNode } from '../../../types/BaseCascader.types'

const CATALOG: BaseCascaderNode[] = [
	{
		id: 'serials',
		label: 'Сериалы и мини-сериалы с русским дубляжом и субтитрами',
		children: [
			{
				id: 'north',
				label: 'Сериал «Северный ветер», сезон 2 — русский дубляж, субтитры и комментарии режиссёра',
				children: [{ id: 'ep1', label: 'Серия 1 «Возвращение на маяк» — расширенная режиссёрская версия' }],
			},
		],
	},
	{ id: 'audio', label: 'Аудиокниги' },
]

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		a11y: { config: { rules: [{ id: 'scrollable-region-focusable', enabled: false }] } },
		docs: {
			...docsFrame(360),
			description: {
				story: 'Длинный путь обрезается многоточием в поле; в колонках длинные подписи переносятся, ширина колонки не растёт.',
			},
		},
	},
	args: { label: 'Раздел каталога', items: CATALOG, modelValue: ['serials', 'north', 'ep1'], placeholder: 'Выберите раздел' },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Раздел каталога' })
		const value = within(field).getByText(/Северный ветер/)
		await expect(value.scrollWidth).toBeGreaterThan(value.clientWidth)
		await userEvent.click(field)
		await waitFor(() => expect(screen.getAllByRole('listbox')).toHaveLength(3))
		const option = screen.getByRole('option', { name: /Серия 1/ })
		await expect(option.scrollWidth).toBeLessThanOrEqual(option.clientWidth)
	},
}
