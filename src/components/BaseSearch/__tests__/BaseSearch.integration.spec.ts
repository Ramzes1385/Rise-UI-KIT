/**
 * Integration-тесты для BaseSearch.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { UI_TEXT } from '@constants'
import BaseSearch from '../ui/BaseSearch.vue'

/** Мокаем DOM-зависимые композаблы */
vi.mock('@composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/useEscapeKey', () => ({ useEscapeKey: vi.fn() }))
vi.mock('@composables/useScrollLock', () => ({ useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }) }))

describe('BaseSearch integration', () => {
	it('должен эмитить update:modelValue при вводе', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSearch, {
			props: { modelValue: '' },
		})

		const input = screen.getByPlaceholderText('Поиск...')
		await user.type(input, 'test')

		expect(emitted()).toHaveProperty('update:modelValue')
		expect(emitted()['update:modelValue']).toContainEqual(['t'])
		expect(emitted()['update:modelValue']).toContainEqual(['te'])
	})

	it('должен эмитить clear при клике на кнопку очистки', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSearch, {
			props: { modelValue: 'some text', hasClear: true },
		})

		const clearBtn = document.querySelector('.base-search__clear')!
		await user.click(clearBtn)

		expect(emitted()).toHaveProperty('clear')
		expect(emitted()['update:modelValue']).toContainEqual([''])
	})

	describe('поле и доступность', () => {
		it('имя поля — текст плейсхолдера (визуально скрытая подпись), и после ввода запроса', () => {
			render(BaseSearch, { props: { modelValue: 'закат', placeholder: 'Поиск картин' } })

			expect(screen.getByRole('textbox', { name: 'Поиск картин' })).toHaveValue('закат')
		})

		it('кнопка очистки названа «Очистить» и не встаёт в порядок Tab', () => {
			render(BaseSearch, { props: { modelValue: 'закат' } })

			expect(screen.getByRole('button', { name: 'Очистить' })).toHaveAttribute('tabindex', '-1')
		})

		it('без иконки у поля нет отступа под префикс', () => {
			const { container } = render(BaseSearch, { props: { hasIcon: false } })

			expect(container.querySelector('.base-input')).not.toHaveClass('base-input--has-prefix')
		})
	})

	describe('результаты', () => {
		const RESULTS = [
			{ id: 1, title: 'Закат в горах', description: 'Картина о закате' },
			{ id: 2, title: 'Весенний сад' },
		]

		it('выделяет совпадения с запросом в названии и описании без учёта регистра', async () => {
			const user = userEvent.setup()
			render(BaseSearch, { props: { modelValue: 'закат', results: RESULTS } })

			await user.click(screen.getByRole('textbox'))
			const marks = Array.from(document.querySelectorAll('.base-search__result mark')).map(mark => mark.textContent)
			expect(marks).toEqual(['Закат', 'закат'])
			expect(document.querySelector('.base-search__result-title')).toHaveTextContent('Закат в горах')
		})

		it('при загрузке без результатов показывает строку «Загрузка...», с результатами — нет', async () => {
			const user = userEvent.setup()
			const { rerender } = render(BaseSearch, { props: { modelValue: 'закат', results: [], isRemote: true, isLoading: true } })

			await user.click(screen.getByRole('textbox'))
			expect(screen.getByText(UI_TEXT.LOADING)).toBeInTheDocument()

			await rerender({ modelValue: 'закат', results: RESULTS, isRemote: true, isLoading: true })
			expect(screen.queryByText(UI_TEXT.LOADING)).not.toBeInTheDocument()
		})
	})

	describe('режим modal', () => {
		it('окно поиска — диалог «Поиск» с кнопкой «Закрыть»; класс подложки из customClass', async () => {
			const user = userEvent.setup()
			render(BaseSearch, {
				props: { mode: 'modal', placeholder: 'Поиск по проекту', customClass: { modalOverlay: 'custom-overlay' } },
			})

			await user.click(screen.getByRole('textbox', { name: 'Поиск по проекту' }))
			const dialog = screen.getByRole('dialog', { name: 'Поиск' })
			expect(dialog.parentElement).toHaveClass('base-search__modal-overlay', 'custom-overlay')

			await user.click(screen.getByRole('button', { name: 'Закрыть' }))
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		})
	})
})
