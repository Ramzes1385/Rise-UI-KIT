/**
 * Integration-тесты для BaseSearch.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { UI_TEXT } from '@/locales/messages'
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

			expect(screen.getByRole('combobox', { name: 'Поиск картин' })).toHaveValue('закат')
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

			await user.click(screen.getByRole('combobox'))
			const marks = Array.from(document.querySelectorAll('.base-search__result mark')).map(mark => mark.textContent)
			expect(marks).toEqual(['Закат', 'закат'])
			expect(document.querySelector('.base-search__result-title')).toHaveTextContent('Закат в горах')
		})

		it('при загрузке без результатов показывает строку «Загрузка...», с результатами — нет', async () => {
			const user = userEvent.setup()
			const { rerender } = render(BaseSearch, { props: { modelValue: 'закат', results: [], isRemote: true, isLoading: true } })

			await user.click(screen.getByRole('combobox'))
			expect(screen.getByText(UI_TEXT.LOADING)).toBeInTheDocument()

			await rerender({ modelValue: 'закат', results: RESULTS, isRemote: true, isLoading: true })
			expect(screen.queryByText(UI_TEXT.LOADING)).not.toBeInTheDocument()
		})
	})

	describe('combobox и список результатов (APG)', () => {
		const RESULTS = [
			{ id: 1, title: 'Закат в горах' },
			{ id: 2, title: 'Закат над морем' },
		]

		it('поле — combobox со списком: aria-expanded, aria-controls, aria-activedescendant следует за подсветкой', async () => {
			const user = userEvent.setup()
			render(BaseSearch, { props: { modelValue: 'закат', results: RESULTS, placeholder: 'Поиск картин' } })
			const field = screen.getByRole('combobox', { name: 'Поиск картин' })
			expect(field).toHaveAttribute('aria-autocomplete', 'list')
			expect(field).toHaveAttribute('aria-expanded', 'false')

			await user.click(field)
			const listbox = screen.getByRole('listbox', { name: 'Поиск картин' })
			expect(field).toHaveAttribute('aria-expanded', 'true')
			expect(field).toHaveAttribute('aria-controls', listbox.id)
			const options = screen.getAllByRole('option')
			expect(options).toHaveLength(2)
			expect(field).not.toHaveAttribute('aria-activedescendant')

			await user.keyboard('{ArrowDown}')
			expect(field).toHaveAttribute('aria-activedescendant', options[0].id)
			expect(options[0]).toHaveAttribute('aria-selected', 'true')
			expect(options[1]).toHaveAttribute('aria-selected', 'false')
		})

		it('статус для скринридера: число результатов, «Ничего не найдено», пусто при загрузке и без запроса', async () => {
			const { rerender } = render(BaseSearch, { props: { modelValue: 'закат', results: RESULTS } })
			const status = () => document.querySelector('.base-search__live')
			expect(status()).toHaveAttribute('role', 'status')
			expect(status()).toHaveTextContent('Найдено 2 результата')

			await rerender({ modelValue: 'рассвет', results: RESULTS })
			expect(status()).toHaveTextContent(UI_TEXT.NO_RESULTS)

			await rerender({ modelValue: 'закат', results: RESULTS, isLoading: true })
			expect(status()).toBeEmptyDOMElement()

			await rerender({ modelValue: '', results: RESULTS, isLoading: false })
			expect(status()).toBeEmptyDOMElement()
		})

		it('в окне поиска поле окна — combobox, результаты — listbox', async () => {
			const user = userEvent.setup()
			render(BaseSearch, { props: { mode: 'modal', modelValue: '', results: RESULTS, placeholder: 'Поиск по проекту' } })

			await user.click(screen.getByRole('textbox', { name: 'Поиск по проекту' }))
			const field = screen.getByRole('combobox', { name: 'Поиск по проекту' })
			expect(field).toHaveAttribute('aria-expanded', 'false')
			await user.type(field, 'закат')

			const listbox = screen.getByRole('listbox')
			expect(field).toHaveAttribute('aria-expanded', 'true')
			expect(field).toHaveAttribute('aria-controls', listbox.id)
			expect(document.querySelector('.base-search__live')).toHaveTextContent('Найдено 2 результата')
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
