/**
 * Unit-тесты для BaseSelect.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import type { BaseSelectOption } from './BaseSelect.types'
import BaseSelect from './BaseSelect.vue'

/** Стандартный набор опций для тестов */
const OPTIONS: BaseSelectOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
	{ value: 'stone', label: 'Камень' },
	{ value: 'glass', label: 'Стекло', description: 'Прозрачный материал' },
	{ value: 'ceramic', label: 'Керамика', isDisabled: true },
]

describe('BaseSelect unit', () => {
	describe('рендер', () => {
		it('должен рендерить селект', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			expect(container.querySelector('.base-select')).toBeInTheDocument()
		})

		it('должен отображать placeholder', () => {
			render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, placeholder: 'Выберите...' },
			})

			expect(screen.getByText('Выберите...')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять модификатор для варианта default', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--default')).toBe(false)
		})

		it('должен применять модификатор --ghost', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, variant: 'ghost' },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--ghost')).toBe(true)
		})

		it('должен применять модификатор --underline', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, variant: 'underline' },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--underline')).toBe(true)
		})
	})

	describe('пропс isDisabled', () => {
		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, isDisabled: true },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--disabled')).toBe(true)
		})
	})

	describe('пропс error', () => {
		it('должен добавлять класс --error когда error не пустой', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, error: 'Обязательное поле' },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--error')).toBe(true)
		})

		it('должен отображать текст ошибки', () => {
			render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, error: 'Обязательное поле' },
			})

			expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
		})

		it('не должен добавлять класс --error когда error пустой', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, error: '' },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--error')).toBe(false)
		})
	})

	describe('пропс label', () => {
		it('должен отображать label', () => {
			render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, label: 'Материал' },
			})

			expect(screen.getByText('Материал')).toBeInTheDocument()
		})

		it('не должен рендерить label когда не задан', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			expect(container.querySelector('.base-select__label')).not.toBeInTheDocument()
		})
	})

	describe('пропс isRequired', () => {
		it('должен отображать звёздочку когда isRequired=true и label задан', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, label: 'Материал', isRequired: true },
			})

			expect(container.querySelector('.base-select__required')).toBeInTheDocument()
		})
	})

	describe('пропс isMultiple', () => {
		it('должен добавлять класс --multiple когда isMultiple=true', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: [], options: OPTIONS, isMultiple: true },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--multiple')).toBe(true)
		})
	})

	describe('выбранное значение', () => {
		it('должен отображать лейбл выбранной опции', () => {
			render(BaseSelect, {
				props: { modelValue: 'metal', options: OPTIONS },
			})

			expect(screen.getByText('Металл')).toBeInTheDocument()
		})

		it('должен отображать placeholder когда значение не выбрано', () => {
			render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, placeholder: 'Выберите материал' },
			})

			expect(screen.getByText('Выберите материал')).toBeInTheDocument()
		})

		it('должен отображать дефолтный placeholder "Выберите..." когда не передан', () => {
			render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			expect(screen.getByText('Выберите...')).toBeInTheDocument()
		})
	})

	describe('пропс isSearchable', () => {
		it('не должен рендерить поле поиска когда isSearchable=false', () => {
			render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, isSearchable: false },
			})

			expect(document.querySelector('.base-select__search')).not.toBeInTheDocument()
		})

		it('должен рендерить поле поиска когда isSearchable=true и дропдаун открыт', async () => {
			render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, isSearchable: true },
			})

			const trigger = document.querySelector('.base-select__trigger') as HTMLElement
			trigger.click()

			await new Promise(r => setTimeout(r, 0))

			expect(document.querySelector('.base-select__search')).toBeInTheDocument()
			expect(document.querySelector('.base-select__search-input')).toBeInTheDocument()
		})
	})

	describe('пропс sizeScale', () => {
		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, sizeScale: 150 },
			})

			const select = container.querySelector('.base-select') as HTMLElement
			expect(select.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('не должен устанавливать --size-scale при sizeScale=100', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, sizeScale: 100 },
			})

			const select = container.querySelector('.base-select') as HTMLElement
			expect(select.style.getPropertyValue('--size-scale')).toBe('')
		})
	})

	describe('emit change', () => {
		it('должен эмитить change при выборе опции', async () => {
			const { emitted } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const trigger = document.querySelector('.base-select__trigger') as HTMLElement
			trigger.click()

			await new Promise(r => setTimeout(r, 0))

			const option = document.querySelector('.base-select__option') as HTMLElement
			option.click()

			expect(emitted()).toHaveProperty('change')
		})

		it('должен эмитить change с правильным значением', async () => {
			const { emitted } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const trigger = document.querySelector('.base-select__trigger') as HTMLElement
			trigger.click()

			await new Promise(r => setTimeout(r, 0))

			const options = document.querySelectorAll('.base-select__option')
			;(options[1] as HTMLElement).click()

			const changeEvents = emitted().change as (string | number)[][]
			expect(changeEvents[0][0]).toBe('wood')
		})
	})

	describe('emit update:modelValue', () => {
		it('должен эмитить update:modelValue при выборе опции', async () => {
			const { emitted } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const trigger = document.querySelector('.base-select__trigger') as HTMLElement
			trigger.click()

			await new Promise(r => setTimeout(r, 0))

			const option = document.querySelector('.base-select__option') as HTMLElement
			option.click()

			expect(emitted()).toHaveProperty('update:modelValue')
		})

		it('должен эмитить update:modelValue с правильным значением при одиночном выборе', async () => {
			const { emitted } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const trigger = document.querySelector('.base-select__trigger') as HTMLElement
			trigger.click()

			await new Promise(r => setTimeout(r, 0))

			const options = document.querySelectorAll('.base-select__option')
			;(options[1] as HTMLElement).click()

			const updateEvents = emitted()['update:modelValue'] as (string | number)[][]
			expect(updateEvents[0][0]).toBe('wood')
		})

		it('должен эмитить update:modelValue с массивом при мультивыборе', async () => {
			const { emitted } = render(BaseSelect, {
				props: { modelValue: [] as string[], options: OPTIONS, isMultiple: true },
			})

			const trigger = document.querySelector('.base-select__trigger') as HTMLElement
			trigger.click()

			await new Promise(r => setTimeout(r, 0))

			const options = document.querySelectorAll('.base-select__option')
			;(options[0] as HTMLElement).click()

			const updateEvents = emitted()['update:modelValue'] as (string | number)[][][]
			expect(updateEvents[0][0]).toEqual(['metal'])
		})
	})

	describe('слот tag', () => {
		it('должен рендерить кастомный слот tag в режиме множественного выбора с выбранными значениями', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: ['metal', 'wood'], options: OPTIONS, isMultiple: true },
				slots: {
					tag: '<span class="custom-tag">Свои теги</span>',
				},
			})

			expect(container.querySelector('.custom-tag')).toBeInTheDocument()
			expect(screen.getByText('Свои теги')).toBeInTheDocument()
		})
	})

	describe('открытие дропдауна', () => {
		it('не должен открывать дропдаун при клике когда isDisabled=true', async () => {
			render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, isDisabled: true },
			})

			const trigger = document.querySelector('.base-select__trigger') as HTMLElement
			trigger.click()

			await new Promise(r => setTimeout(r, 0))

			expect(document.querySelector('.base-select__option')).not.toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, customClass: 'custom-select-class' },
			})

			expect(container.querySelector('.base-select')).toHaveClass('custom-select-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseSelect, {
				props: {
					modelValue: 'metal',
					options: OPTIONS,
					label: 'Материал',
					error: 'Ошибка',
					customClass: {
						root: 'custom-root',
						label: 'custom-label',
						trigger: 'custom-trigger',
						errorText: 'custom-error',
					},
				},
			})

			expect(container.querySelector('.base-select')).toHaveClass('custom-root')
			expect(container.querySelector('.base-select__label')).toHaveClass('custom-label')
			expect(container.querySelector('.base-select__trigger')).toHaveClass('custom-trigger')
			expect(container.querySelector('.base-select__error-text')).toHaveClass('custom-error')
		})
	})
})
