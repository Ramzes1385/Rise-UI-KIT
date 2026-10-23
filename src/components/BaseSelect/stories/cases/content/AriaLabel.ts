import { docsFrame } from '../../shared'
import type meta from '../../BaseSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const AriaLabel: StoryObj<typeof meta> = {
	args: { label: '', ariaLabel: 'Город доставки', placeholder: 'Город', triggerAttrs: { 'data-qa': 'delivery-city' } },
	parameters: {
		docs: {
			...docsFrame(320),
			description: {
				story: [
					'Селект без видимой подписи (фильтр в панели, ячейка таблицы) называется пропсом `ariaLabel` — и триггер, и список.',
					'Без него имя — плейсхолдер. `triggerAttrs` передаёт атрибуты триггеру: `id`, `data-*`, `aria-describedby`.',
				].join('\n'),
			},
		},
		controls: { include: ['ariaLabel', 'placeholder', 'variant', 'sizeScale', 'isDisabled'] },
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await expect(trigger).toHaveAttribute('data-qa', 'delivery-city')
		trigger.focus()
		await userEvent.keyboard('{ArrowDown}')
		await expect(await screen.findByRole('listbox', { name: 'Город доставки' })).toBeInTheDocument()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
	},
}
