/**
 * Unit-тесты для useTableFilter.
 */

import { ref } from 'vue'

import type { TableColumn } from '@components/BaseTable/model/BaseTable.types'

import { useTableFilter } from './useTableFilter'

const testColumns = ref<TableColumn[]>([
	{ key: 'name', label: 'Имя' },
	{ key: 'city', label: 'Город' },
])

describe('useTableFilter', () => {
	it('добавляет фильтр и вызывает onFilter', () => {
		const onFilter = vi.fn()
		const { activeFilters, addFilter } = useTableFilter({ columns: testColumns, onFilter })

		addFilter(ref('city'), ref('eq'), ref('Москва'))

		expect(activeFilters.value).toHaveLength(1)
		expect(activeFilters.value[0]).toEqual({ key: 'city', operator: 'eq', value: 'Москва' })
		expect(onFilter).toHaveBeenCalledWith(activeFilters.value)
	})

	it('не добавляет фильтр с пустым значением', () => {
		const { activeFilters, addFilter } = useTableFilter({ columns: testColumns })
		addFilter(ref('city'), ref('eq'), ref(''))
		expect(activeFilters.value).toHaveLength(0)
	})

	it('удаляет фильтр по индексу', () => {
		const onFilter = vi.fn()
		const { activeFilters, addFilter, removeFilter } = useTableFilter({ columns: testColumns, onFilter })
		addFilter(ref('city'), ref('eq'), ref('Москва'))
		removeFilter(0)
		expect(activeFilters.value).toHaveLength(0)
		expect(onFilter).toHaveBeenCalledTimes(2)
	})

	it('формирует читаемую метку фильтра', () => {
		const { activeFilters, addFilter, getFilterLabel } = useTableFilter({ columns: testColumns })
		addFilter(ref('city'), ref('eq'), ref('Москва'))
		expect(getFilterLabel(activeFilters.value[0])).toBe('Город = Москва')
	})

	it('использует ключ колонки как fallback в метке', () => {
		const { getFilterLabel } = useTableFilter({ columns: testColumns })
		expect(getFilterLabel({ key: 'unknown', operator: 'eq', value: 'x' })).toBe('unknown = x')
	})
})
