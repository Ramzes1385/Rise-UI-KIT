import '@testing-library/jest-dom/vitest'
import { UI_ARIA } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import BasePagination from '../ui/BasePagination.vue'
import { render, screen } from '@testing-library/vue'

describe('BasePagination integration', () => {
	describe('переключение страниц', () => {
		it('должен эмитить update:modelValue при клике на страницу', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePagination, {
				props: { modelValue: 1, total: 50, pageSize: 10 },
			})

			await user.click(screen.getByText('3'))

			expect(emitted()).toHaveProperty('update:modelValue')
			const events = emitted()['update:modelValue'] as number[][]
			expect(events.at(-1)?.[0]).toBe(3)
		})

		it('должен эмитить change при переключении', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePagination, {
				props: { modelValue: 1, total: 50, pageSize: 10 },
			})

			await user.click(screen.getByText('2'))

			expect(emitted()).toHaveProperty('change')
		})
	})

	describe('кнопка Вперед', () => {
		it('должен эмитить следующую страницу при клике на кнопку вперед', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePagination, {
				props: { modelValue: 1, total: 50, pageSize: 10 },
			})

			const buttons = container.querySelectorAll('.base-button')
			const nextButton = buttons[buttons.length - 1] as HTMLElement
			await user.click(nextButton)

			const events = emitted()['update:modelValue'] as number[][]
			expect(events.at(-1)?.[0]).toBe(2)
		})
	})

	describe('кнопка Назад', () => {
		it('должен эмитить предыдущую страницу при клике на кнопку назад', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePagination, {
				props: { modelValue: 3, total: 50, pageSize: 10 },
			})

			const buttons = container.querySelectorAll('.base-button')
			const prevButton = buttons[0] as HTMLElement
			await user.click(prevButton)

			const events = emitted()['update:modelValue'] as number[][]
			expect(events.at(-1)?.[0]).toBe(2)
		})
	})

	describe('текущая страница', () => {
		it('должен помечать ровно одну текущую страницу aria-current="page"', () => {
			render(BasePagination, {
				props: { modelValue: 2, total: 50, pageSize: 10 },
			})

			const current = screen.getAllByRole('button', { current: 'page' })
			expect(current).toHaveLength(1)
			expect(current[0]).toHaveTextContent('2')
		})

		it('должен переносить aria-current при внешней смене modelValue', async () => {
			const { rerender } = render(BasePagination, {
				props: { modelValue: 1, total: 50, pageSize: 10 },
			})

			await rerender({ modelValue: 4 })

			expect(screen.getByRole('button', { current: 'page' })).toHaveTextContent('4')
		})

		it('должен оформлять текущую страницу иначе, чем остальные, при variant по умолчанию', () => {
			render(BasePagination, {
				props: { modelValue: 2, total: 50, pageSize: 10 },
			})

			const currentButton = screen.getByText('2').closest('button')
			const otherButton = screen.getByText('3').closest('button')
			expect(currentButton?.className).not.toBe(otherButton?.className)
		})
	})

	describe('страница за пределами диапазона', () => {
		it('«назад» отсчитывает от прижатой текущей страницы, если modelValue больше totalPages', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePagination, {
				props: { modelValue: 5, total: 30, pageSize: 10 },
			})

			const [prevButton] = container.querySelectorAll<HTMLButtonElement>('.base-pagination > button')
			await user.click(prevButton)

			expect(emitted()['update:modelValue']).toEqual([[2]])
		})

		it('«вперёд» заблокирована, если modelValue больше totalPages', () => {
			const { container } = render(BasePagination, {
				props: { modelValue: 5, total: 30, pageSize: 10 },
			})

			const buttons = container.querySelectorAll<HTMLButtonElement>('.base-pagination > button')
			expect(buttons[buttons.length - 1]).toHaveAttribute('aria-disabled', 'true')
		})

		it('«назад» и «вперёд» заблокированы, когда страниц нет (total=0)', () => {
			const { container } = render(BasePagination, {
				props: { modelValue: 1, total: 0, pageSize: 10 },
			})

			const buttons = container.querySelectorAll<HTMLButtonElement>('.base-pagination > button')
			expect(buttons).toHaveLength(2)
			expect(buttons[0]).toHaveAttribute('aria-disabled', 'true')
			expect(buttons[1]).toHaveAttribute('aria-disabled', 'true')
		})
	})

	describe('доступные имена', () => {
		it('кнопки «назад» и «вперёд» имеют доступные имена', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePagination, {
				props: { modelValue: 2, total: 50, pageSize: 10 },
			})

			await user.click(screen.getByRole('button', { name: 'Следующая страница' }))
			await user.click(screen.getByRole('button', { name: 'Предыдущая страница' }))

			expect(emitted()['update:modelValue']).toEqual([[3], [1]])
		})
	})

	describe('многоточия', () => {
		it('не должны быть кликабельными', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePagination, {
				props: { modelValue: 5, total: 200, pageSize: 10, maxVisible: 7 },
			})

			const ellipsis = container.querySelector('.base-pagination__ellipsis') as HTMLElement
			if (ellipsis) {
				await user.click(ellipsis)
				expect(emitted()).not.toHaveProperty('update:modelValue')
			}
		})

		it('два многоточия не дают предупреждения Vue о дублирующихся ключах', async () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
			try {
				const { container, rerender } = render(BasePagination, {
					props: { modelValue: 10, total: 70, pageSize: 10 },
				})
				await rerender({ total: 500 })
				expect(container.querySelectorAll('.base-pagination__ellipsis')).toHaveLength(2)

				const duplicateKeyWarnings = warn.mock.calls.filter(([message]) => String(message).includes('Duplicate keys'))
				expect(duplicateKeyWarnings).toHaveLength(0)
			} finally {
				warn.mockRestore()
			}
		})
	})

	describe('оформление текущей страницы', () => {
		it('текущая страница помечена классом --current, стрелки и остальные страницы — вариантом ghost', () => {
			const { container } = render(BasePagination, {
				props: { modelValue: 2, total: 50, pageSize: 10 },
			})

			const current = screen.getByRole('button', { current: 'page' })
			expect(current).toHaveClass('base-pagination__page--current')
			expect(screen.getByText('3').closest('button')).toHaveClass('base-button--ghost')
			expect(container.querySelectorAll('.base-pagination__arrow.base-button--ghost')).toHaveLength(2)
		})
	})

	describe('доступность и лишние события (PG-3, PG-6)', () => {
		it('корень — ориентир <nav> «Пагинация», номера названы «Страница N»', () => {
			render(BasePagination, { props: { modelValue: 2, total: 50, pageSize: 10 } })

			expect(screen.getByRole('navigation', { name: 'Пагинация' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Страница 2' })).toHaveAttribute('aria-current', 'page')
			expect(screen.getByRole('button', { name: 'Страница 5' })).not.toHaveAttribute('aria-current')
		})

		it('ariaLabel заменяет имя ориентира: две пагинации на странице различимы', () => {
			render(BasePagination, { props: { modelValue: 1, total: 50, ariaLabel: 'Страницы заказов' } })

			expect(screen.getByRole('navigation', { name: 'Страницы заказов' })).toBeInTheDocument()
		})

		it('клик по текущей странице не эмитит событий', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePagination, { props: { modelValue: 2, total: 50, pageSize: 10 } })

			await user.click(screen.getByRole('button', { name: 'Страница 2' }))

			expect(emitted()).not.toHaveProperty('update:modelValue')
			expect(emitted()).not.toHaveProperty('change')
		})

		it('с клавиатуры: Tab до номера и Enter переключают страницу', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePagination, { props: { modelValue: 2, total: 50, pageSize: 10 } })

			await user.tab()
			await user.tab()
			expect(screen.getByRole('button', { name: 'Страница 1' })).toHaveFocus()
			await user.keyboard('{Enter}')

			expect(emitted('change')).toEqual([[1]])
		})

		it('modelValue за краем: текущая — прижатая страница, «назад» ведёт на предыдущую от неё, «вперёд» выключена', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePagination, { props: { modelValue: 99, total: 200, pageSize: 10 } })

			expect(screen.getByRole('button', { name: 'Страница 20' })).toHaveAttribute('aria-current', 'page')
			expect(screen.getByRole('button', { name: UI_ARIA.PAGINATION_NEXT })).toHaveAttribute('aria-disabled', 'true')
			await user.click(screen.getByRole('button', { name: UI_ARIA.PAGINATION_PREV }))

			expect(emitted('change')).toEqual([[19]])
		})

		it('клик по прижатой текущей странице возвращает родителю допустимое значение', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePagination, { props: { modelValue: 99, total: 200, pageSize: 10 } })

			await user.click(screen.getByRole('button', { name: 'Страница 20' }))

			expect(emitted('update:modelValue')).toEqual([[20]])
		})

		it('modelValue=0 и NaN: текущая — первая, «назад» выключена', () => {
			render(BasePagination, { props: { modelValue: Number.NaN, total: 50, pageSize: 10 } })

			expect(screen.getByRole('button', { name: 'Страница 1' })).toHaveAttribute('aria-current', 'page')
			expect(screen.getByRole('button', { name: UI_ARIA.PAGINATION_PREV })).toHaveAttribute('aria-disabled', 'true')
		})

		it('без showLastPage на последней странице окно доходит до неё (PG-4)', () => {
			render(BasePagination, { props: { modelValue: 20, total: 200, pageSize: 10, showLastPage: false } })

			expect(screen.getByRole('button', { name: 'Страница 20' })).toHaveAttribute('aria-current', 'page')
		})
	})
})
