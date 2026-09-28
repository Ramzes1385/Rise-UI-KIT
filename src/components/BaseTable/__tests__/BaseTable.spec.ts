/**
 * Unit-тесты для BaseTable.
 * Проверяют рендер, CSS-модификаторы, пропсы, эмиты и слоты.
 */

import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseTable from '../ui/BaseTable.vue'
import type { ColumnFilter, TableColumn, TableRow } from '../model/BaseTable.types'

/** Стабаем дочерние компоненты для изоляции */
const globalConfig = {
	stubs: {
		BaseInput: {
			template:
				'<input class="base-input-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keydown="$emit(\'keydown\', $event)" />',
			props: ['modelValue', 'placeholder', 'size', 'sizeScale'],
			emits: ['update:modelValue', 'keydown'],
		},
		BaseSelect: {
			template:
				'<select class="base-select-stub" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option></select>',
			props: ['modelValue', 'options', 'placeholder', 'size', 'sizeScale'],
			emits: ['update:modelValue'],
		},
		BaseButton: {
			template: '<button class="base-button-stub" @click="$emit(\'click\')"><slot /></button>',
			props: ['variant', 'sizeScale', 'isLoading', 'isDisabled', 'padding'],
			emits: ['click'],
		},
		BaseCheckbox: {
			template:
				'<label class="base-checkbox-stub"><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /></label>',
			props: ['modelValue', 'isDisabled', 'sizeScale', 'label'],
			emits: ['update:modelValue'],
		},
		BaseText: {
			template: '<component :is="tag || \'span\'" :class="customClass"><slot /></component>',
			props: ['tag', 'customClass'],
		},
		BaseIcon: true,
		BaseLoader: true,
		BaseTooltip: {
			template: '<span class="base-tooltip-stub"><slot /></span>',
			props: ['text', 'position', 'sizeScale'],
		},
		BaseBadge: {
			template: '<span class="base-badge-stub"><slot /></span>',
			props: ['variant', 'sizeScale'],
		},
		BaseSkeleton: {
			template: '<span class="base-skeleton-stub"></span>',
			props: ['shape', 'width', 'height', 'sizeScale'],
		},
		BasePagination: {
			template: '<div class="base-pagination-stub"><button @click="$emit(\'update:modelValue\', 2)">2</button></div>',
			props: ['modelValue', 'total', 'pageSize', 'maxVisible', 'variant', 'sizeScale'],
			emits: ['update:modelValue'],
		},
		BaseDropdown: {
			template: '<div class="base-dropdown-stub"><slot /><slot name="dropdown" /></div>',
			props: ['isOpen', 'sizeScale'],
		},
	},
}

const COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя' },
	{ key: 'age', label: 'Возраст' },
]

const SORTABLE_COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя', isSortable: true, sortType: 'string' },
	{ key: 'age', label: 'Возраст', isSortable: true, sortType: 'number' },
]

const ROWS: TableRow[] = [
	{ id: '1', data: { name: 'Иван', age: 25 } },
	{ id: '2', data: { name: 'Мария', age: 30 } },
]

describe('BaseTable unit', () => {
	describe('рендер', () => {
		it('должен рендерить таблицу', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table')).toBeInTheDocument()
		})

		it('должен рендерить заголовки колонок', () => {
			render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			expect(screen.getByText('Имя')).toBeInTheDocument()
			expect(screen.getByText('Возраст')).toBeInTheDocument()
		})

		it('должен рендерить данные строк', () => {
			render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			expect(screen.getByText('Иван')).toBeInTheDocument()
			expect(screen.getByText('Мария')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен не добавлять модификатор для default', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			const table = container.querySelector('.base-table')
			expect(table?.classList.contains('base-table--default')).toBe(false)
			expect(table?.classList.contains('base-table--bordered')).toBe(false)
			expect(table?.classList.contains('base-table--striped')).toBe(false)
		})

		it('должен применять модификатор --bordered', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, variant: 'bordered' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__body')?.classList.contains('base-table--bordered')).toBe(true)
		})

		it('должен применять модификатор --striped', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, variant: 'striped' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__body')?.classList.contains('base-table--striped')).toBe(true)
		})
	})

	describe('пропс isLoading', () => {
		it('должен рендерить скелетон когда isLoading=true и нет строк', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: [], isLoading: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-skeleton-stub')).toBeInTheDocument()
		})

		it('должен рендерить оверлей загрузки когда isLoading=true и есть строки', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, isLoading: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__loading-overlay')).toBeInTheDocument()
		})

		it('не должен рендерить индикатор загрузки когда isLoading=false', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, isLoading: false },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__loading-overlay')).not.toBeInTheDocument()
			expect(container.querySelector('.base-skeleton-stub')).not.toBeInTheDocument()
		})
	})

	describe('behavior.selectable', () => {
		it('должен рендерить колонку чекбоксов когда behavior.selectable=true', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, behavior: { selectable: true } },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__th--check')).toBeInTheDocument()
			expect(container.querySelector('.base-table__td--check')).toBeInTheDocument()
		})

		it('не должен рендерить колонку чекбоксов когда behavior.selectable=false', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, behavior: { selectable: false } },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__th--check')).not.toBeInTheDocument()
			expect(container.querySelector('.base-table__td--check')).not.toBeInTheDocument()
		})
	})

	describe('features.search', () => {
		it('должен рендерить панель поиска когда features.search=true', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, features: { search: true } },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__search')).toBeInTheDocument()
		})

		it('не должен рендерить панель поиска когда features.search=false', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, features: { search: false } },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__search')).not.toBeInTheDocument()
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, sizeScale: 100 },
				global: globalConfig,
			})

			const table = container.querySelector('.base-table') as HTMLElement
			expect(table.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, sizeScale: 150 },
				global: globalConfig,
			})

			const table = container.querySelector('.base-table') as HTMLElement
			expect(table.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('должен устанавливать --size-scale=0.75 когда sizeScale=75', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, sizeScale: 75 },
				global: globalConfig,
			})

			const table = container.querySelector('.base-table') as HTMLElement
			expect(table.style.getPropertyValue('--size-scale')).toBe('0.75')
		})
	})

	describe('пропс padding', () => {
		it('должен устанавливать CSS-переменные padding для числа', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, padding: 12 },
				global: globalConfig,
			})

			const table = container.querySelector('.base-table') as HTMLElement
			expect(table.style.getPropertyValue('--tbl-pad-top')).toBe('12px')
			expect(table.style.getPropertyValue('--tbl-pad-bottom')).toBe('12px')
			expect(table.style.getPropertyValue('--tbl-pad-left')).toBe('24px')
			expect(table.style.getPropertyValue('--tbl-pad-right')).toBe('24px')
		})

		it('без padding не пишет inline-переменные: отступы 12px 16px берутся из стилей', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			const table = container.querySelector('.base-table') as HTMLElement
			expect(table.style.getPropertyValue('--tbl-pad-top')).toBe('')
			expect(table.style.getPropertyValue('--tbl-pad-left')).toBe('')
		})

		it('должен поддерживать объект с точечными сторонами', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, padding: { x: 16, top: 4, bottom: 8 } },
				global: globalConfig,
			})

			const table = container.querySelector('.base-table') as HTMLElement
			expect(table.style.getPropertyValue('--tbl-pad-top')).toBe('4px')
			expect(table.style.getPropertyValue('--tbl-pad-bottom')).toBe('8px')
			expect(table.style.getPropertyValue('--tbl-pad-left')).toBe('16px')
			expect(table.style.getPropertyValue('--tbl-pad-right')).toBe('16px')
		})
	})

	describe('пропс emptyText', () => {
		it('должен показывать кастомный текст пустого состояния', () => {
			render(BaseTable, {
				props: { columns: COLUMNS, rows: [], emptyText: 'Список пуст' },
				global: globalConfig,
			})

			expect(screen.getByText('Список пуст')).toBeInTheDocument()
		})

		it('должен показывать текст по умолчанию "Нет данных"', () => {
			render(BaseTable, {
				props: { columns: COLUMNS, rows: [] },
				global: globalConfig,
			})

			expect(screen.getByText('Нет данных')).toBeInTheDocument()
		})
	})

	describe('эмиты', () => {
		it('должен эмитить sort при клике на сортируемый заголовок', async () => {
			const { container, emitted } = render(BaseTable, {
				props: { columns: SORTABLE_COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			const th = container.querySelector('.base-table__th--sortable')
			await fireEvent.click(th!)

			expect(emitted()).toHaveProperty('sort')
		})

		it('должен эмитить select при клике на чекбокс строки', async () => {
			const { container, emitted } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, behavior: { selectable: true } },
				global: globalConfig,
			})

			const checkbox = container.querySelector('.base-table__td--check input')
			await fireEvent.click(checkbox!)

			expect(emitted()).toHaveProperty('select')
		})

		it('должен эмитить row-click при клике на строку', async () => {
			const { container, emitted } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			const row = container.querySelector('tr.base-table__tr')!
			await fireEvent.click(row)

			expect(emitted()).toHaveProperty('row-click')
		})

		it('должен эмитить select при клике на чекбокс выделения всех строк', async () => {
			const { container, emitted } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, behavior: { selectable: true } },
				global: globalConfig,
			})

			const checkbox = container.querySelector('.base-table__th--check input')!
			await fireEvent.click(checkbox)

			expect(emitted()).toHaveProperty('select')
		})

		it('должен эмитить filter при добавлении фильтра', async () => {
			const { container, emitted } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, features: { filters: true } },
				global: globalConfig,
			})

			// Выбрать колонку фильтра
			const columnSelect = container.querySelector('.base-table__filters .base-select-stub')! as HTMLSelectElement
			columnSelect.value = 'name'
			await fireEvent.change(columnSelect)

			// Ввести значение фильтра
			const valueInput = container.querySelector('.base-table__filters .base-input-stub')! as HTMLInputElement
			await fireEvent.update(valueInput, 'Иван')

			// Нажать кнопку добавления
			const addBtn = container.querySelector('.base-table__filter-add-btn')!
			await fireEvent.click(addBtn)

			expect(emitted()).toHaveProperty('filter')
			expect((emitted() as Record<string, unknown[][]>).filter[0][0]).toEqual([{ key: 'name', operator: 'contains', value: 'Иван' }])
		})

		it('должен эмитить search после дебаунса', async () => {
			vi.useFakeTimers()

			const { container, emitted } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, features: { search: true }, searchDebounce: 100 },
				global: globalConfig,
			})

			const searchInput = container.querySelector('.base-table__search .base-input-stub')!
			await fireEvent.update(searchInput, 'Иван')

			// До дебаунса — эвента нет
			expect(emitted().search).toBeUndefined()

			// После дебаунса — эвент есть
			vi.advanceTimersByTime(150)

			expect(emitted()).toHaveProperty('search')
			expect((emitted() as Record<string, unknown[][]>).search[0][0]).toBe('Иван')

			vi.useRealTimers()
		})

		it('должен эмитить expand при клике на раскрываемую строку', async () => {
			const expandableRows: TableRow[] = [{ id: '1', data: { name: 'Иван', age: 25 }, isExpandable: true }]
			const { container, emitted } = render(BaseTable, {
				props: { columns: COLUMNS, rows: expandableRows },
				global: globalConfig,
			})

			const row = container.querySelector('tr.base-table__tr')!
			await fireEvent.click(row)

			expect(emitted()).toHaveProperty('expand')
			expect(((emitted() as Record<string, unknown[][]>).expand[0][0] as Record<string, unknown>).id).toBe('1')
		})

		it('должен эмитить page-change при смене страницы', async () => {
			const manyRows: TableRow[] = Array.from({ length: 20 }, (_, i) => ({
				id: String(i + 1),
				data: { name: `Пользователь ${i + 1}`, age: 20 + i },
			}))

			const { container, emitted } = render(BaseTable, {
				props: {
					columns: COLUMNS,
					rows: manyRows,
					pageSize: 5,
					loadMode: 'pagination',
				},
				global: globalConfig,
			})

			// Клик на кнопку страницы 2 в стабе пагинации
			const pageBtn = container.querySelector('.base-pagination-stub button')!
			await fireEvent.click(pageBtn)

			expect(emitted()).toHaveProperty('page-change')
			expect((emitted() as Record<string, unknown[][]>)['page-change'][0][0]).toBe(2)
		})

		it('должен эмитить page-size-change при изменении размера страницы', async () => {
			const { container, emitted } = render(BaseTable, {
				props: {
					columns: COLUMNS,
					rows: ROWS,
					features: { pageSizeSelector: true },
					pageSizeOptions: [5, 10, 20],
					pageSize: 5,
					loadMode: 'pagination',
				},
				global: globalConfig,
			})

			const pageSizeSelect = container.querySelector('.base-table__page-size .base-select-stub')! as HTMLSelectElement
			pageSizeSelect.value = '10'
			await fireEvent.change(pageSizeSelect)

			expect(emitted()).toHaveProperty('page-size-change')
			expect((emitted() as Record<string, unknown[][]>)['page-size-change'][0][0]).toBe(10)
		})

		it('должен эмитить load-more при клике на кнопку загрузки', async () => {
			const manyRows: TableRow[] = Array.from({ length: 20 }, (_, i) => ({
				id: String(i + 1),
				data: { name: `Пользователь ${i + 1}`, age: 20 + i },
			}))

			const { container, emitted } = render(BaseTable, {
				props: {
					columns: COLUMNS,
					rows: manyRows,
					loadMode: 'button',
					pageSize: 5,
				},
				global: globalConfig,
			})

			const loadMoreBtn = container.querySelector('.base-table__load-more .base-button-stub')!
			await fireEvent.click(loadMoreBtn)

			expect(emitted()).toHaveProperty('load-more')
		})

		it('должен эмитить column-resize после ресайза колонки', async () => {
			const resizableColumns: TableColumn[] = [
				{ key: 'name', label: 'Имя', isResizable: true },
				{ key: 'age', label: 'Возраст', isResizable: true },
			]

			const { container, emitted } = render(BaseTable, {
				props: { columns: resizableColumns, rows: ROWS },
				global: globalConfig,
			})

			const resizer = container.querySelector('.base-table__resizer')!
			await fireEvent.mouseDown(resizer, { pageX: 100 })
			await fireEvent.mouseMove(document, { pageX: 150 })
			await fireEvent.mouseUp(document)

			expect(emitted()).toHaveProperty('column-resize')
			expect((emitted() as Record<string, unknown[][]>)['column-resize'][0][0]).toBe('name')
			expect((emitted() as Record<string, unknown[][]>)['column-resize'][0][1] as number).toBeGreaterThan(0)
		})

		it('должен рендерить ресайзер для всех колонок при behavior.resizable=true', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, behavior: { resizable: true } },
				global: globalConfig,
			})

			const resizers = container.querySelectorAll('.base-table__resizer')
			expect(resizers.length).toBe(COLUMNS.length)
		})

		it('не должен рендерить ресайзер без behavior.resizable на таблице и колонке', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			const resizers = container.querySelectorAll('.base-table__resizer')
			expect(resizers.length).toBe(0)
		})

		it('должен рендерить ресайзер при behavior.resizable=true даже без isResizable на колонке', () => {
			const columns: TableColumn[] = [
				{ key: 'name', label: 'Имя' },
				{ key: 'age', label: 'Возраст' },
			]
			const { container } = render(BaseTable, {
				props: { columns, rows: ROWS, behavior: { resizable: true } },
				global: globalConfig,
			})

			const resizers = container.querySelectorAll('.base-table__resizer')
			expect(resizers.length).toBe(2)
		})

		it('должен эмитить columns-change при переключении видимости колонки', async () => {
			const { container, emitted } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, features: { columnSettings: true } },
				global: globalConfig,
			})

			const settingsCheckbox = container.querySelector('.base-table__settings .base-checkbox-stub input')!
			await fireEvent.click(settingsCheckbox)

			expect(emitted()).toHaveProperty('columns-change')
		})
	})

	describe('слоты', () => {
		it('должен рендерить содержимое слота empty', () => {
			render(BaseTable, {
				props: { columns: COLUMNS, rows: [] },
				slots: { empty: '<div class="custom-empty">Пусто!</div>' },
				global: globalConfig,
			})

			expect(screen.getByText('Пусто!')).toBeInTheDocument()
		})

		it('должен рендерить содержимое слота header', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				slots: { header: '<div class="custom-header">Заголовок</div>' },
				global: globalConfig,
			})

			expect(container.querySelector('.custom-header')).toBeInTheDocument()
			expect(screen.getByText('Заголовок')).toBeInTheDocument()
		})

		it('должен рендерить содержимое слота footer', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				slots: { footer: '<div class="custom-footer">Подвал</div>' },
				global: globalConfig,
			})

			expect(container.querySelector('.custom-footer')).toBeInTheDocument()
			expect(screen.getByText('Подвал')).toBeInTheDocument()
		})

		it('должен рендерить header и footer внутри base-table__body', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				slots: {
					header: '<div class="custom-header">Заголовок</div>',
					footer: '<div class="custom-footer">Подвал</div>',
				},
				global: globalConfig,
			})

			const body = container.querySelector('.base-table__body')
			expect(body).toBeInTheDocument()
			expect(body!.querySelector('.base-table__header')).toBeInTheDocument()
			expect(body!.querySelector('.base-table__footer')).toBeInTheDocument()
			expect(body!.querySelector('.custom-header')).toBeInTheDocument()
			expect(body!.querySelector('.custom-footer')).toBeInTheDocument()
		})

		it('не должен рендерить обёртку header/footer без слота', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__header')).not.toBeInTheDocument()
			expect(container.querySelector('.base-table__footer')).not.toBeInTheDocument()
		})
	})

	describe('пустое состояние', () => {
		it('должен рендерить таблицу без строк', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: [] },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__table')).toBeInTheDocument()
		})
	})

	describe('features.rowNumber', () => {
		it('должен рендерить колонку с номерами строк когда features.rowNumber=true', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, features: { rowNumber: true } },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__th--number')).toBeInTheDocument()
			expect(container.querySelector('.base-table__td--number')).toBeInTheDocument()
		})

		it('не должен рендерить колонку с номерами когда features.rowNumber=false', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, features: { rowNumber: false } },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__th--number')).not.toBeInTheDocument()
		})
	})

	describe('пропс color', () => {
		it('должен применять кастомный цвет', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, color: { bg: { base: '#ff0000' } } },
				global: globalConfig,
			})

			const table = container.querySelector('.base-table') as HTMLElement
			expect(table.style.getPropertyValue('--custom-bg')).toBe('#ff0000')
		})
	})

	describe('пропс height', () => {
		it('должен устанавливать maxHeight когда передан height', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, height: '500px' },
				global: globalConfig,
			})

			const wrapper = container.querySelector('.base-table__wrapper') as HTMLElement
			expect(wrapper.style.maxHeight).toBe('500px')
		})
	})

	describe('выделение строк', () => {
		it('должен добавлять класс --selected для выбранных строк', () => {
			const { container } = render(BaseTable, {
				props: {
					columns: COLUMNS,
					rows: [{ id: '1', data: { name: 'Иван', age: 25 }, isSelected: true }],
				},
				global: globalConfig,
			})

			const row = container.querySelector('tr.base-table__tr')
			expect(row?.classList.contains('base-table__tr--selected')).toBe(true)
		})
	})

	describe('features.columnSettings', () => {
		it('должен рендерить настройки колонок когда features.columnSettings=true', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, features: { columnSettings: true } },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__settings')).toBeInTheDocument()
		})

		it('не должен рендерить настройки колонок когда features.columnSettings=false', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, features: { columnSettings: false } },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__settings')).not.toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, customClass: 'custom-table-class' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table')?.classList.contains('custom-table-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseTable, {
				props: {
					columns: COLUMNS,
					rows: ROWS,
					features: { search: true, filters: true, columnSettings: true, pageSizeSelector: true },
					pageSizeOptions: [1, 2],
					pageSize: 1,
					loadMode: 'pagination',
					customClass: {
						root: 'custom-root',
						body: 'custom-body',
						header: 'custom-header',
						toolbar: 'custom-toolbar',
						search: 'custom-search',
						filters: 'custom-filters',
						settings: 'custom-settings',
						activeFilters: 'custom-active-filters',
						wrapper: 'custom-wrapper',
						loadingOverlay: 'custom-loading-overlay',
						table: 'custom-table',
						thead: 'custom-thead',
						tr: 'custom-tr',
						th: 'custom-th',
						tbody: 'custom-tbody',
						td: 'custom-td',
						loadMore: 'custom-load-more',
						footerBar: 'custom-footer-bar',
						pageSize: 'custom-page-size',
						paginationInfo: 'custom-pagination-info',
						footer: 'custom-footer',
					},
				},
				slots: {
					header: '<div class="custom-header-slot">Header</div>',
					footer: '<div class="custom-footer-slot">Footer</div>',
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-table')?.classList.contains('custom-root')).toBe(true)
			expect(container.querySelector('.base-table__body')?.classList.contains('custom-body')).toBe(true)
			expect(container.querySelector('.base-table__header')?.classList.contains('custom-header')).toBe(true)
			expect(container.querySelector('.base-table__toolbar')?.classList.contains('custom-toolbar')).toBe(true)
			expect(container.querySelector('.base-table__search')?.classList.contains('custom-search')).toBe(true)
			expect(container.querySelector('.base-table__filters')?.classList.contains('custom-filters')).toBe(true)
			expect(container.querySelector('.base-table__settings')?.classList.contains('custom-settings')).toBe(true)
			expect(container.querySelector('.base-table__wrapper')?.classList.contains('custom-wrapper')).toBe(true)
			expect(container.querySelector('.base-table__table')?.classList.contains('custom-table')).toBe(true)
			expect(container.querySelector('.base-table__table thead')?.classList.contains('custom-thead')).toBe(true)
			expect(container.querySelector('.base-table__table tr')?.classList.contains('custom-tr')).toBe(true)
			expect(container.querySelector('.base-table__table th')?.classList.contains('custom-th')).toBe(true)
			expect(container.querySelector('.base-table__table tbody')?.classList.contains('custom-tbody')).toBe(true)
			expect(container.querySelector('.base-table__table td')?.classList.contains('custom-td')).toBe(true)
			expect(container.querySelector('.base-table__footer-bar')?.classList.contains('custom-footer-bar')).toBe(true)
			expect(container.querySelector('.base-table__page-size')?.classList.contains('custom-page-size')).toBe(true)
			expect(container.querySelector('.base-table__pagination-info')?.classList.contains('custom-pagination-info')).toBe(true)
			expect(container.querySelector('.base-table__footer')?.classList.contains('custom-footer')).toBe(true)
		})
	})

	describe('вложенная таблица (nestedConfig)', () => {
		const NESTED_COLUMNS: TableColumn[] = [{ key: 'detail', label: 'Деталь' }]

		const NESTED_ROWS: TableRow[] = [
			{
				id: '1',
				data: { name: 'Иван', age: 25 },
				isExpanded: true,
				children: [{ id: '1-1', data: { detail: 'Подробность' } }],
			},
		]

		it('не должен рендерить заголовок вложенной таблицы когда nestedConfig без title', () => {
			const { container } = render(BaseTable, {
				props: {
					columns: COLUMNS,
					rows: NESTED_ROWS,
					nestedConfig: { columns: NESTED_COLUMNS, childrenKey: 'children' },
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__nested-wrapper')).toBeInTheDocument()
			expect(container.querySelector('.base-table__nested-title')).not.toBeInTheDocument()
		})

		it('должен рендерить заголовок вложенной таблицы когда nestedConfig с title', () => {
			const { container } = render(BaseTable, {
				props: {
					columns: COLUMNS,
					rows: NESTED_ROWS,
					nestedConfig: { columns: NESTED_COLUMNS, title: 'Детали', childrenKey: 'children' },
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__nested-title')).toBeInTheDocument()
		})
	})

	describe('infinite scroll', () => {
		it('должен рендерить индикатор подгрузки когда isLoading=true, loadMode=infinite и есть строки', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, isLoading: true, loadMode: 'infinite' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__td--loading-more')).toBeInTheDocument()
		})
	})

	describe('регрессии аудита', () => {
		/** Свежие колонки на каждый тест: проверяем, что таблица не мутирует объекты из props */
		function createColumns(extra: Partial<TableColumn> = {}): TableColumn[] {
			return [
				{ key: 'name', label: 'Имя', ...extra },
				{ key: 'age', label: 'Возраст', ...extra },
			]
		}

		/** Значения колонки «Возраст» в порядке отображения строк */
		function renderedAges(container: Element): string[] {
			return Array.from(container.querySelectorAll('tbody tr')).map(row => row.querySelectorAll('td')[1]?.textContent?.trim() ?? '')
		}

		/** Стабы без BaseCheckbox: нужен реальный чекбокс, отображающий modelValue */
		const stubsWithRealCheckbox = Object.fromEntries(Object.entries(globalConfig.stubs).filter(([name]) => name !== 'BaseCheckbox'))

		afterEach(() => {
			document.body.style.cursor = ''
			document.body.style.userSelect = ''
		})

		it('TBL-1: пустые значения остаются в конце при сортировке по числу', async () => {
			const rows: TableRow[] = [
				{ id: '1', data: { name: 'А', age: 30 } },
				{ id: '2', data: { name: 'Б', age: null } },
				{ id: '3', data: { name: 'В', age: 10 } },
				{ id: '4', data: { name: 'Г' } },
				{ id: '5', data: { name: 'Д', age: 20 } },
			]
			const { container } = render(BaseTable, {
				props: { columns: SORTABLE_COLUMNS, rows },
				global: globalConfig,
			})

			await fireEvent.click(screen.getByRole('columnheader', { name: 'Возраст' }))

			expect(renderedAges(container)).toEqual(['10', '20', '30', '', ''])
		})

		it('TBL-2: «Выбрать все» при поиске выбирает только найденные строки и так же снимает выбор', async () => {
			const rows: TableRow[] = [
				{ id: '1', data: { name: 'Иван', age: 25 } },
				{ id: '2', data: { name: 'Мария', age: 30 } },
				{ id: '3', data: { name: 'Иванна', age: 41 } },
			]
			const { container, emitted } = render(BaseTable, {
				props: { columns: createColumns(), rows, features: { search: true }, behavior: { selectable: true }, searchDebounce: 0 },
				global: globalConfig,
			})

			// «Мария» выбрана до поиска и затем скрыта им
			await fireEvent.click(container.querySelectorAll('.base-table__td--check input')[1])
			await fireEvent.update(container.querySelector('.base-table__search .base-input-stub')!, 'иван')
			const selectAll = container.querySelector('.base-table__th--check input')!

			await fireEvent.click(selectAll)
			const selectEvents = emitted().select as TableRow[][][]
			expect(selectEvents.at(-1)![0].map(row => row.id)).toEqual(['1', '3'])

			await fireEvent.click(selectAll)
			expect(selectEvents.at(-1)![0]).toEqual([])
		})

		it('TBL-5: переключение видимости не мутирует объект колонки из props', async () => {
			const columns = createColumns()
			const { container } = render(BaseTable, {
				props: { columns, rows: ROWS, features: { columnSettings: true } },
				global: globalConfig,
			})

			await fireEvent.click(container.querySelector('.base-table__settings .base-checkbox-stub input')!)

			expect(screen.queryByRole('columnheader', { name: 'Имя' })).not.toBeInTheDocument()
			expect(columns[0].isHidden).toBeUndefined()
		})

		it('TBL-5: ресайз меняет ширину во внутреннем состоянии, не мутируя объект колонки из props', async () => {
			const columns = createColumns({ isResizable: true })
			const { container, emitted } = render(BaseTable, {
				props: { columns, rows: ROWS },
				global: globalConfig,
			})

			await fireEvent.mouseDown(container.querySelector('.base-table__resizer')!, { pageX: 100 })
			await fireEvent.mouseMove(document, { pageX: 180 })
			await fireEvent.mouseUp(document)

			expect(emitted()['column-resize']).toBeTruthy()
			expect(container.querySelector<HTMLElement>('colgroup col')?.style.width).toMatch(/px$/)
			expect(columns[0].width).toBeUndefined()
		})

		it('TBL-5: после обновления props columns чекбокс настроек отражает фактическую видимость', async () => {
			const columns = createColumns()
			const { container, rerender } = render(BaseTable, {
				props: { columns, rows: ROWS, features: { columnSettings: true } },
				global: { stubs: stubsWithRealCheckbox },
			})
			const nameSettingsItem = () => container.querySelector('.base-table__settings-item')!

			await rerender({ columns: columns.map(column => ({ ...column })) })
			await fireEvent.click(nameSettingsItem().querySelector('input')!)

			expect(screen.queryByRole('columnheader', { name: 'Имя' })).not.toBeInTheDocument()
			// Галочка BaseCheckbox рендерится только при modelValue=true
			expect(nameSettingsItem().querySelector('.base-checkbox__icon')).not.toBeInTheDocument()
		})

		it('TBL-5: isHidden и width, изменённые родителем в props, применяются к таблице', async () => {
			const columns = createColumns()
			const { container, rerender } = render(BaseTable, {
				props: { columns, rows: ROWS },
				global: globalConfig,
			})

			await rerender({
				columns: [
					{ ...columns[0], isHidden: true },
					{ ...columns[1], width: '120px' },
				],
			})

			expect(screen.queryByRole('columnheader', { name: 'Имя' })).not.toBeInTheDocument()
			expect(container.querySelector<HTMLElement>('colgroup col')?.style.width).toBe('120px')
		})

		it('TBL-5: выбор пользователя сохраняется, если родитель пересоздал колонки с теми же значениями', async () => {
			const columns = createColumns()
			const { container, rerender } = render(BaseTable, {
				props: { columns, rows: ROWS, features: { columnSettings: true } },
				global: globalConfig,
			})

			await fireEvent.click(container.querySelectorAll('.base-table__settings .base-checkbox-stub input')[1])
			await rerender({ columns: columns.map(column => ({ ...column, label: `${column.label}!` })) })

			expect(screen.getByRole('columnheader', { name: 'Имя!' })).toBeInTheDocument()
			expect(screen.queryByRole('columnheader', { name: 'Возраст!' })).not.toBeInTheDocument()
		})

		it('TBL-6: сортировка с клавиатуры кнопкой в заголовке, состояние передаётся через aria-sort', async () => {
			const user = userEvent.setup()
			const rows: TableRow[] = [
				{ id: '1', data: { name: 'А', age: 30 } },
				{ id: '2', data: { name: 'Б', age: 25 } },
				{ id: '3', data: { name: 'В', age: 40 } },
			]
			const { container, emitted } = render(BaseTable, {
				props: { columns: SORTABLE_COLUMNS, rows },
				global: globalConfig,
			})
			const sortButton = screen.getByRole('button', { name: 'Возраст' })
			const header = sortButton.closest('th')!
			expect(header).toHaveAttribute('aria-sort', 'none')

			sortButton.focus()
			await user.keyboard('{Enter}')
			expect(header).toHaveAttribute('aria-sort', 'ascending')
			expect(renderedAges(container)).toEqual(['25', '30', '40'])

			await user.keyboard(' ')
			expect(header).toHaveAttribute('aria-sort', 'descending')
			expect(renderedAges(container)).toEqual(['40', '30', '25'])
			expect(emitted().sort).toHaveLength(2)
		})

		it('TBL-6: у несортируемой колонки нет кнопки сортировки и aria-sort', () => {
			render(BaseTable, {
				props: { columns: createColumns(), rows: ROWS },
				global: globalConfig,
			})

			expect(screen.queryByRole('button', { name: 'Имя' })).not.toBeInTheDocument()
			expect(screen.getByRole('columnheader', { name: 'Имя' })).not.toHaveAttribute('aria-sort')
		})

		it('TBL-12: размонтирование во время ресайза возвращает user-select и курсор body', async () => {
			const { container, unmount } = render(BaseTable, {
				props: { columns: createColumns({ isResizable: true }), rows: ROWS },
				global: globalConfig,
			})

			await fireEvent.mouseDown(container.querySelector('.base-table__resizer')!, { pageX: 100 })
			expect(document.body.style.userSelect).toBe('none')

			unmount()

			expect(document.body.style.userSelect).toBe('')
			expect(document.body.style.cursor).toBe('')
		})
	})

	describe('доступные имена и клавиатура', () => {
		/** Стабы без BaseCheckbox и BaseButton: нужны настоящие подписи чекбоксов и атрибуты кнопок */
		const realControlStubs = Object.fromEntries(
			Object.entries(globalConfig.stubs).filter(([name]) => name !== 'BaseCheckbox' && name !== 'BaseButton'),
		)

		afterEach(() => {
			vi.restoreAllMocks()
		})

		it('чекбоксы выбора названы: «Выбрать все строки» и «Выбрать строку N»', () => {
			render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, behavior: { selectable: true } },
				global: { stubs: realControlStubs },
			})

			expect(screen.getByRole('checkbox', { name: 'Выбрать все строки' })).toBeInTheDocument()
			expect(screen.getByRole('checkbox', { name: 'Выбрать строку 2' })).not.toBeChecked()
		})

		it('отключённая строка помечена aria-disabled, её чекбокс заблокирован', () => {
			render(BaseTable, {
				props: { columns: COLUMNS, rows: [{ ...ROWS[0], isDisabled: true }, ROWS[1]], behavior: { selectable: true } },
				global: { stubs: realControlStubs },
			})

			const checkbox = screen.getByRole('checkbox', { name: 'Выбрать строку 1' })
			expect(checkbox).toBeDisabled()
			expect(checkbox.closest('tr')).toHaveAttribute('aria-disabled', 'true')
		})

		it('кнопка раскрытия строки названа и сообщает состояние через aria-expanded', async () => {
			const user = userEvent.setup()
			render(BaseTable, {
				props: { columns: COLUMNS, rows: [{ ...ROWS[0], isExpandable: true }] },
				slots: { 'expanded-content': '<p>Подробности</p>' },
				global: { stubs: realControlStubs },
			})

			const button = screen.getByRole('button', { name: 'Развернуть строку' })
			expect(button).toHaveAttribute('aria-expanded', 'false')

			await user.click(button)

			expect(button).toHaveAttribute('aria-expanded', 'true')
			expect(button).toHaveAccessibleName('Свернуть строку')
		})

		it('у заголовка колонки раскрытия есть текст для скринридера', () => {
			render(BaseTable, {
				props: { columns: COLUMNS, rows: [{ ...ROWS[0], isExpandable: true }] },
				global: globalConfig,
			})

			expect(screen.getByRole('columnheader', { name: 'Развернуть' })).toBeInTheDocument()
		})

		it('мультисортировка: приоритет колонки — описание кнопки сортировки, а не часть её имени', async () => {
			const user = userEvent.setup()
			render(BaseTable, {
				props: { columns: SORTABLE_COLUMNS, rows: ROWS, behavior: { multiSort: true } },
				global: globalConfig,
			})

			await user.click(screen.getByRole('button', { name: 'Имя' }))
			await user.click(screen.getByRole('button', { name: 'Возраст' }))

			expect(screen.getByRole('button', { name: 'Имя' })).toHaveAccessibleDescription('Приоритет сортировки: 1')
			expect(screen.getByRole('button', { name: 'Возраст' })).toHaveAccessibleDescription('Приоритет сортировки: 2')
			expect(screen.getByRole('columnheader', { name: 'Возраст' })).toHaveAttribute('aria-sort', 'ascending')
		})

		it('без пропа isLoading таблица не помечена aria-busy, при загрузке — помечена', async () => {
			const { rerender } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})
			const table = screen.getByRole('table')
			expect(table).not.toHaveAttribute('aria-busy')

			await rerender({ isLoading: true })

			expect(table).toHaveAttribute('aria-busy', 'true')
		})

		it('прокручиваемая область таблицы получает tabindex=0: её можно прокрутить с клавиатуры', async () => {
			vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(600)
			vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200)
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, height: '200px' },
				global: globalConfig,
			})
			await nextTick()

			expect(container.querySelector('.base-table__wrapper')).toHaveAttribute('tabindex', '0')
		})

		it('без прокрутки у области таблицы нет tabindex', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__wrapper')).not.toHaveAttribute('tabindex')
		})

		it('открытие панели «Колонки» переводит фокус на первый чекбокс панели', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, features: { columnSettings: true } },
				global: globalConfig,
			})

			await user.click(container.querySelector('.base-table__settings-btn')!)
			await nextTick()

			expect(document.activeElement).toBe(container.querySelector('.base-table__settings-list input'))
		})

		it('кнопка удаления фильтра названа условием и удаляет фильтр', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, features: { filters: true } },
				global: globalConfig,
			})
			const columnSelect = container.querySelector('.base-table__filters .base-select-stub') as HTMLSelectElement
			columnSelect.value = 'name'
			await fireEvent.change(columnSelect)
			await fireEvent.update(container.querySelector('.base-table__filters .base-input-stub')!, 'Иван')
			await fireEvent.click(container.querySelector('.base-table__filter-add-btn')!)

			await user.click(screen.getByRole('button', { name: 'Удалить фильтр: Имя ∋ Иван' }))

			const filterEvents = emitted().filter as ColumnFilter[][][]
			expect(filterEvents.at(-1)![0]).toEqual([])
			expect(screen.queryByRole('button', { name: /Удалить фильтр/ })).not.toBeInTheDocument()
		})
	})
})
