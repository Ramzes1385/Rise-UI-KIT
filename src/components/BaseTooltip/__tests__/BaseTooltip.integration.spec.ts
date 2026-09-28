import '@testing-library/jest-dom/vitest'
import BaseTooltip from '../ui/BaseTooltip.vue'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'

/** Задержки показа и скрытия подсказки, мс — как в BaseTooltip */
const SHOW_DELAY = 100
const HIDE_DELAY = 150

/** Пауза дольше заданной задержки: отложенный показ или скрытие успели бы сработать. */
function waitLongerThan(delay: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, delay * 2))
}

describe('BaseTooltip integration', () => {
	describe('наведение', () => {
		it('должен показывать тултип при наведении', async () => {
			const user = userEvent.setup()
			render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<button>Цель</button>' },
			})

			await user.hover(screen.getByText('Цель'))

			await waitFor(() => {
				expect(screen.getByText('Подсказка')).toBeInTheDocument()
			})
		})

		it('должен скрывать тултип при уходе курсора', async () => {
			const user = userEvent.setup()
			render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<button>Цель</button>' },
			})

			await user.hover(screen.getByText('Цель'))

			await waitFor(() => {
				expect(screen.getByText('Подсказка')).toBeInTheDocument()
			})

			await user.unhover(screen.getByText('Цель'))

			await waitFor(() => {
				expect(screen.queryByText('Подсказка')).not.toBeInTheDocument()
			})
		})
	})

	describe('isAlwaysVisible', () => {
		it('наведение и уход курсора не скрывают постоянную подсказку', async () => {
			const user = userEvent.setup()
			render(BaseTooltip, {
				props: { text: 'Подсказка', isAlwaysVisible: true },
				slots: { default: '<button>Цель</button>' },
			})
			const trigger = screen.getByRole('button', { name: 'Цель' })
			expect(await screen.findByRole('tooltip')).toBeInTheDocument()

			await user.hover(trigger)
			await user.unhover(trigger)
			await waitLongerThan(HIDE_DELAY)
			expect(screen.getByRole('tooltip')).toBeInTheDocument()
		})
	})

	describe('клавиатура', () => {
		it('показывает подсказку при фокусе на триггере и сразу скрывает по Escape', async () => {
			const user = userEvent.setup()
			render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<button>Цель</button>' },
			})

			await user.tab()
			expect(screen.getByRole('button', { name: 'Цель' })).toHaveFocus()
			expect(await screen.findByRole('tooltip')).toHaveTextContent('Подсказка')

			await user.keyboard('{Escape}')
			await waitFor(() => {
				expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
			})
			expect(screen.getByRole('button', { name: 'Цель' })).toHaveFocus()
		})

		it('скрывает подсказку, когда фокус уходит с триггера', async () => {
			const user = userEvent.setup()
			render({
				components: { BaseTooltip },
				template: '<div><BaseTooltip text="Подсказка"><button>Цель</button></BaseTooltip><button>Дальше</button></div>',
			})

			await user.tab()
			expect(await screen.findByRole('tooltip')).toBeInTheDocument()

			await user.tab()
			expect(screen.getByRole('button', { name: 'Дальше' })).toHaveFocus()
			await waitFor(() => {
				expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
			})
		})

		it('Escape отменяет отложенный показ: подсказка не появляется снова', async () => {
			const user = userEvent.setup()
			render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<button>Цель</button>' },
			})

			await user.tab()
			expect(await screen.findByRole('tooltip')).toBeInTheDocument()
			// повторное наведение запускает новый таймер показа
			await user.hover(screen.getByRole('button', { name: 'Цель' }))
			await user.keyboard('{Escape}')
			await waitFor(() => {
				expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
			})

			await waitLongerThan(SHOW_DELAY)
			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
		})

		it('Escape во время задержки скрытия скрывает подсказку и отменяет таймер', async () => {
			const user = userEvent.setup()
			render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<button>Цель</button>' },
			})
			const trigger = screen.getByRole('button', { name: 'Цель' })

			await user.tab()
			expect(await screen.findByRole('tooltip')).toBeInTheDocument()
			await user.hover(trigger)
			// уход курсора запускает таймер скрытия, фокус остаётся на триггере
			await user.unhover(trigger)
			await user.keyboard('{Escape}')
			await waitFor(() => {
				expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
			})

			await waitLongerThan(HIDE_DELAY)
			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
			expect(trigger).toHaveFocus()
		})
	})
})
