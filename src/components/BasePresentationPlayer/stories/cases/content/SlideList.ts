import { tabTo } from '@/stories/helpers'
import { notedSlides } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import type meta from '../../BasePresentationPlayer.stories'

export const SlideList: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Выдвижная панель, как «Серии» BaseMediaPlayer. «Список слайдов» — карточки: номер, миниатюра, длительность,',
					'название; у текущего — рамка, у пройденного — галочка, у недоступного (`linear`/`strict`) — замок, нажатие',
					'объявляет, через сколько откроется. «Стенограмма» (`slides[].notes`, абзацы через пустую строку) — текст',
					'текущего слайда; кнопка есть, когда стенограмма есть хотя бы у одного слайда. Закрытие — Escape, «Закрыть»,',
					'клик снаружи; фокус возвращается на кнопку панели.',
					'Проверка: Tab до «Список слайдов» и Enter — фокус на текущей карточке, дальние недоступны; Escape; затем',
					'«Стенограмма» и переключатель видов.',
				].join('\n'),
			},
		},
	},
	args: {
		navigation: 'linear',
		slides: notedSlides({ minDuration: 6 }),
	},
	play: async ({ canvas, userEvent }) => {
		const listButton = canvas.getByRole('button', { name: 'Список слайдов' })
		await expect(listButton).toHaveAttribute('aria-expanded', 'false')
		await tabTo(listButton, userEvent)
		await userEvent.keyboard('{Enter}')

		const panel = within(await canvas.findByRole('region', { name: 'Список слайдов' }))
		await waitFor(() => expect(panel.getByRole('button', { name: /Кто мы/ })).toHaveFocus())
		await expect(panel.getByRole('button', { name: /Кто мы/ })).toHaveAttribute('aria-current', 'true')
		const locked = panel.getByRole('button', { name: 'Команда Недоступен' })
		await expect(locked).toHaveAttribute('aria-disabled', 'true')

		await tabTo(locked, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByText(/^Доступно через \d+ с$/, { selector: '[role="status"]' })).toBeInTheDocument()
		await expect(canvas.getByRole('slider', { name: 'Слайды' })).toHaveAttribute('aria-valuetext', 'Слайд 1 из 3: Кто мы')

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('region', { name: 'Список слайдов' })).not.toBeInTheDocument())
		await expect(listButton).toHaveFocus()

		const notesButton = canvas.getByRole('button', { name: 'Стенограмма' })
		await tabTo(notesButton, userEvent)
		await userEvent.keyboard('{Enter}')
		const notes = within(await canvas.findByRole('region', { name: 'Стенограмма' }))
		await waitFor(() => expect(notes.getByText('Мы делаем курсы для новых сотрудников.')).toBeVisible())

		const toList = notes.getByRole('button', { name: 'Список слайдов' })
		await expect(toList).toHaveAttribute('aria-pressed', 'false')
		await tabTo(toList, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByRole('region', { name: 'Список слайдов' })).toBeInTheDocument()
	},
}
