import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/vue'
import BaseTableNestedRow from '../ui/BaseTableNestedRow.vue'
import { TABLE_EXPAND_TRANSITION_KEY } from '../model/BaseTable.types'

const mockTransitionCallbacks = {
	onExpandBeforeEnter: vi.fn(),
	onExpandEnter: vi.fn(),
	onExpandAfterEnter: vi.fn(),
	onCollapseBeforeLeave: vi.fn(),
	onCollapseLeave: vi.fn(),
	onCollapseAfterLeave: vi.fn(),
}

function renderWithTransition(component: Parameters<typeof render>[0], options: Parameters<typeof render>[1] = {}) {
	return render(component, {
		...options,
		global: {
			...options?.global,
			provide: {
				...(options?.global?.provide ?? {}),
				[TABLE_EXPAND_TRANSITION_KEY as symbol]: mockTransitionCallbacks,
			},
		},
	})
}

describe('BaseTableNestedRow', () => {
	const mockRow = { id: '1', data: { name: 'Parent' }, children: [{ id: '1-1', data: { name: 'Child' } }] }
	const mockColumns = [{ key: 'name', label: 'Name' }]

	const defaultProps = {
		row: mockRow,
		columns: mockColumns,
		totalColumns: 2,
		sizeScale: 20,
		isSelectable: false,
		hasRowNumber: false,
		isExpanded: vi.fn().mockReturnValue(true),
		getColumnStyle: vi.fn().mockReturnValue({}),
		formatCellValue: vi.fn().mockReturnValue('Child'),
	}

	it('должен рендерить вложенную таблицу, если есть nestedConfig и children', () => {
		const props = {
			...defaultProps,
			nestedConfig: {
				title: 'Children',
				columns: [{ key: 'name', label: 'Name' }],
			},
		}
		const { container } = renderWithTransition(BaseTableNestedRow, { props })

		expect(container.querySelector('.base-table__nested-wrapper')).toBeInTheDocument()
		expect(container.querySelector('.base-table__nested-title')).toHaveTextContent('Children')
	})

	it('должен рендерить дочерние строки напрямую, если нет nestedConfig', () => {
		const { container } = renderWithTransition(BaseTableNestedRow, { props: defaultProps })

		expect(container.querySelector('.base-table__tr--child')).toBeInTheDocument()
		expect(container.querySelector('.base-table__td--expand')).toBeInTheDocument()
	})

	it('не должен рендерить ничего, если row не развернут', () => {
		const props = {
			...defaultProps,
			isExpanded: vi.fn().mockReturnValue(false),
		}
		const { container } = renderWithTransition(BaseTableNestedRow, { props })

		expect(container.querySelector('.base-table__nested-wrapper')).not.toBeInTheDocument()
		expect(container.querySelector('.base-table__tr--child')).not.toBeInTheDocument()
	})

	it('должен рендерить чекбокс и номер строки для дочерних элементов, если включено', () => {
		const props = {
			...defaultProps,
			isSelectable: true,
			hasRowNumber: true,
		}
		const { container } = renderWithTransition(BaseTableNestedRow, { props })

		expect(container.querySelector('.base-table__td--check')).toBeInTheDocument()
		expect(container.querySelector('.base-table__td--number')).toBeInTheDocument()
	})
})
