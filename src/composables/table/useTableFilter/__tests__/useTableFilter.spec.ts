import { ref } from 'vue'
import { useTableFilter } from '../useTableFilter'
import type { TableColumn } from '@components/BaseTable/types/BaseTable.types'

const testColumns = ref<TableColumn[]>([
	{ key: 'name', label: 'Имя' },
	{ key: 'city', label: 'Город' },
])

describe('useTableFilter', () => {
	it('добавляет фильтр и вызывает onFilter', () => {
		const onFilter = vi.fn()
		const { activeFilters, addFilter } = useTableFilter({ columns: testColumns, onFilter })

		addFilter({ column: ref('city'), operator: ref('eq'), value: ref('Москва') })

		expect(activeFilters.value).toHaveLength(1)
		expect(activeFilters.value[0]).toEqual({ key: 'city', operator: 'eq', value: 'Москва' })
		expect(onFilter).toHaveBeenCalledWith(activeFilters.value)
	})

	it('не добавляет фильтр с пустым значением', () => {
		const { activeFilters, addFilter } = useTableFilter({ columns: testColumns })
		addFilter({ column: ref('city'), operator: ref('eq'), value: ref('') })
		expect(activeFilters.value).toHaveLength(0)
	})

	it('удаляет фильтр по индексу', () => {
		const onFilter = vi.fn()
		const { activeFilters, addFilter, removeFilter } = useTableFilter({ columns: testColumns, onFilter })
		addFilter({ column: ref('city'), operator: ref('eq'), value: ref('Москва') })
		removeFilter(0)
		expect(activeFilters.value).toHaveLength(0)
		expect(onFilter).toHaveBeenCalledTimes(2)
	})

	it('формирует читаемую метку фильтра', () => {
		const { activeFilters, addFilter, getFilterLabel } = useTableFilter({ columns: testColumns })
		addFilter({ column: ref('city'), operator: ref('eq'), value: ref('Москва') })
		expect(getFilterLabel(activeFilters.value[0])).toBe('Город = Москва')
	})

	it('использует ключ колонки как fallback в метке', () => {
		const { getFilterLabel } = useTableFilter({ columns: testColumns })
		expect(getFilterLabel({ key: 'unknown', operator: 'eq', value: 'x' })).toBe('unknown = x')
	})

	it('TBL-16: событие filter получает копию, которую таблица потом не меняет', () => {
		const onFilter = vi.fn()
		const { addFilter, activeFilters } = useTableFilter({ columns: testColumns, onFilter })
		addFilter({ column: ref('city'), operator: ref('eq'), value: ref('Москва') })
		const payload = onFilter.mock.calls[0][0]
		expect(payload).not.toBe(activeFilters.value)
		expect(payload[0]).not.toBe(activeFilters.value[0])
	})

	it('between: добавляет обе границы, очищает черновик и не принимает неполный диапазон', () => {
		const { activeFilters, addFilter } = useTableFilter({ columns: testColumns })
		const value = ref('10')
		const valueTo = ref('')
		addFilter({ column: ref('city'), operator: ref('between'), value, valueTo })
		expect(activeFilters.value).toHaveLength(0)
		valueTo.value = '20'
		addFilter({ column: ref('city'), operator: ref('between'), value, valueTo })
		expect(activeFilters.value).toEqual([{ key: 'city', operator: 'between', value: '10', valueTo: '20' }])
		expect([value.value, valueTo.value]).toEqual(['', ''])
	})

	it('between без поля верхней границы не добавляется', () => {
		const { activeFilters, addFilter } = useTableFilter({ columns: testColumns })
		addFilter({ column: ref('city'), operator: ref('between'), value: ref('10') })
		expect(activeFilters.value).toHaveLength(0)
	})

	it('in: сохраняет копию выбранных значений, value — их список для показа', () => {
		const { activeFilters, addFilter } = useTableFilter({ columns: testColumns })
		const values = ref(['a', 'b'])
		addFilter({ column: ref('city'), operator: ref('in'), value: ref(''), values })
		expect(activeFilters.value).toEqual([{ key: 'city', operator: 'in', value: 'a, b', values: ['a', 'b'] }])
		expect(values.value).toEqual([])
		addFilter({ column: ref('city'), operator: ref('in'), value: ref(''), values })
		addFilter({ column: ref('city'), operator: ref('in'), value: ref('') })
		expect(activeFilters.value).toHaveLength(1)
	})

	it('без колонки фильтр не добавляется', () => {
		const { activeFilters, addFilter } = useTableFilter({ columns: testColumns })
		addFilter({ column: ref(''), operator: ref('eq'), value: ref('x') })
		expect(activeFilters.value).toHaveLength(0)
	})

	it('метка по колонке с типом: дата словом, диапазон, список подписями вариантов', () => {
		const columns = ref<TableColumn[]>([
			{ key: 'date', label: 'Дата', sortType: 'date' },
			{ key: 'status', label: 'Статус', filterConfig: { type: 'multi-select', options: [{ value: 'new', label: 'Новый' }] } },
		])
		const { getFilterLabel } = useTableFilter({ columns })
		expect(getFilterLabel({ key: 'date', operator: 'gte', value: '2025-05-14' })).toMatch(/^Дата .+ 2025-05-14$/)
		expect(getFilterLabel({ key: 'date', operator: 'between', value: '2025-05-01', valueTo: '2025-05-31' })).toBe(
			'Дата: 2025-05-01 – 2025-05-31',
		)
		expect(getFilterLabel({ key: 'status', operator: 'in', value: 'new', values: ['new'] })).toBe('Статус ∈ Новый')
	})
})
