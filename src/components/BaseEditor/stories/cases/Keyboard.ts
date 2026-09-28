import { tabTo } from '@/stories/helpers'
import type meta from '../BaseEditor.stories'
import { renderWithLocalModel } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, within, waitFor } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab проходит по кнопкам тулбара и попадает в текст (видно кольцо фокуса), Shift+Tab возвращает',
					'к последней кнопке. Ctrl+B / Ctrl+I / Ctrl+U (⌘ на macOS) переключают начертание выделенного текста.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	render: renderWithLocalModel,
	args: { modelValue: '<p>Проверка клавиатуры</p>' },
	play: async ({ canvas, userEvent }) => {
		const bold = canvas.getByRole('button', { name: 'Жирный' })
		await userEvent.tab()
		await expect(bold).toHaveFocus()

		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await tabTo(textbox, userEvent, 30)
		await expect(getComputedStyle(textbox.closest('.base-editor') as HTMLElement).boxShadow).not.toBe('none')

		await userEvent.tripleClick(within(textbox).getByText('Проверка клавиатуры'))
		await userEvent.keyboard('{Control>}b{/Control}')
		await waitFor(() => expect(bold).toHaveAttribute('aria-pressed', 'true'))
		await userEvent.keyboard('{Control>}i{/Control}')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Курсив' })).toHaveAttribute('aria-pressed', 'true'))

		await userEvent.tab({ shift: true })
		await expect(canvas.getByRole('button', { name: 'Режим кода' })).toHaveFocus()
	},
}
