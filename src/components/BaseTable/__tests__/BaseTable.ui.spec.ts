import '@testing-library/jest-dom/vitest'
import BaseTable from '../ui/BaseTable.vue'
import { createUiKitPlugin } from '@/plugin'
import { useUi } from '@composables/base/useUi'
import { render, screen } from '@testing-library/vue'
import { defineComponent, h, nextTick, provide } from 'vue'
import BaseTableToolbar from '../ui/toolbar/BaseTableToolbar.vue'
import { TABLE_PARTS, TABLE_UI_KEY } from '../types/BaseTable.types'
import type { BaseTablePart, TableColumn, TableRow } from '../types/BaseTable.types'
import type { BaseTableToolbarProps } from '../types/toolbar/BaseTableToolbar.types'

const COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя', isSortable: true, isResizable: true, width: '200px' },
	{ key: 'city', label: 'Город' },
]

const ROWS: TableRow[] = [
	{ id: 1, data: { name: 'Анна', city: 'Москва' }, isExpandable: true, isExpanded: true },
	{ id: 2, data: { name: 'Иван', city: 'Казань' } },
	{ id: 3, data: { name: 'Олег', city: 'Самара' }, children: [{ id: 31, data: { name: 'Пётр', city: 'Тула' } }], isExpanded: true },
]

const allUi = Object.fromEntries(['root', ...TABLE_PARTS].map(part => [part, `u-${part}`])) as Record<BaseTablePart | 'root', string>

const SLOTS = {
	header: '<span>Заказы</span>',
	footer: '<span>Итого</span>',
	'expanded-content': '<p>Подробности</p>',
}

function part(container: Element, name: string): HTMLElement {
	return container.querySelector<HTMLElement>(`.base-table__${name}`)!
}

describe('BaseTable: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseTable, { props: { columns: COLUMNS, rows: ROWS }, slots: SLOTS })

		expect(container.querySelector('.base-table')).toHaveAttribute('class', 'base-table')
		expect(part(container, 'body')).toHaveAttribute('class', 'base-table__body')
		expect(part(container, 'header')).toHaveAttribute('class', 'base-table__header')
		expect(part(container, 'tbody')).toHaveAttribute('class', 'base-table__tbody')
		expect(part(container, 'th')).toHaveAttribute('class', 'base-table__th base-table__th--expand')
		expect(part(container, 'sort-btn')).toHaveAttribute('class', 'base-table__sort-btn')
		expect(part(container, 'tr')).toHaveAttribute('class', 'base-table__tr base-table__tr--expandable')
		expect(part(container, 'td')).toHaveAttribute('class', 'base-table__td base-table__td--expand')
		expect(part(container, 'expanded-wrapper')).toHaveAttribute('class', 'base-table__expanded-wrapper')
		expect(part(container, 'footer')).toHaveAttribute('class', 'base-table__footer')
	})

	it('классы частей добавляются к классам кита и к customClass', () => {
		const { container } = render(BaseTable, {
			props: {
				columns: COLUMNS,
				rows: ROWS,
				pageSize: 2,
				pageSizeOptions: [2, 5],
				isLoading: true,
				features: { search: true, filters: true, columnSettings: true, export: true, pageSizeSelector: true },
				behavior: { resizable: true },
				nestedConfig: { columns: COLUMNS, childrenKey: 'children', title: 'Состав' },
				customClass: { root: 'own-root', th: 'own-th', td: 'own-td' },
				ui: allUi,
			},
			slots: SLOTS,
		})

		expect(container.querySelector('.base-table')).toHaveClass('base-table', 'u-root', 'own-root')
		expect(part(container, 'body')).toHaveClass('base-table__body', 'u-body')
		expect(part(container, 'th')).toHaveClass('u-th', 'own-th', 'base-table__th--expand')
		expect(part(container, 'td')).toHaveClass('u-td', 'own-td', 'base-table__td--expand')
		expect(part(container, 'tr')).toHaveClass('u-tr', 'base-table__tr--expandable')
		const absent = new Set(['load-more', 'active-filters', 'nested-wrapper', 'selection-status'])
		for (const name of TABLE_PARTS.filter(item => !absent.has(item))) expect(part(container, name)).toHaveClass(`u-${name}`)
	})

	it('вложенная таблица, кнопка «Загрузить ещё» и строки скелетона', async () => {
		const { container, rerender } = render(BaseTable, {
			props: {
				columns: COLUMNS,
				rows: [ROWS[2], ROWS[0], ROWS[1]],
				variant: 'striped',
				loadMode: 'button',
				pageSize: 2,
				nestedConfig: { columns: COLUMNS, childrenKey: 'children' },
				ui: allUi,
			},
		})
		expect(screen.getByRole('button', { name: 'Загрузить еще' })).toBeInTheDocument()
		expect(part(container, 'body')).toHaveClass('base-table__body', 'u-body', 'base-table--striped')
		expect(part(container, 'load-more')).toHaveClass('base-table__load-more', 'u-load-more')
		expect(part(container, 'nested-wrapper')).toHaveClass('base-table__nested-wrapper', 'u-nested-wrapper')
		expect(container.querySelector('.base-table__nested-wrapper .base-table')).toHaveAttribute('class', 'base-table')

		await rerender({ rows: [], isLoading: true })
		const skeletonRow = container.querySelector('.base-table__tr--skeleton')!
		expect(skeletonRow).not.toHaveClass('u-tr')
		expect(skeletonRow.querySelector('td')).toHaveClass('base-table__td', 'u-td')
	})

	it('дочерние строки и пустая таблица получают классы частей', async () => {
		const { container, rerender } = render(BaseTable, { props: { columns: COLUMNS, rows: ROWS, ui: { tr: 'u-tr', td: 'u-td' } } })

		expect(container.querySelector('.base-table__tr--child')).toHaveClass('base-table__tr', 'u-tr')
		expect(container.querySelector('.base-table__tr--child td')).toHaveClass('base-table__td', 'u-td')

		await rerender({ rows: [] })
		expect(part(container, 'td--empty')).toHaveClass('base-table__td', 'u-td')
	})

	it('классы из defaults.BaseTable.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseTable, {
			props: { columns: COLUMNS, rows: ROWS, ui: { th: 'own-th' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTable: { ui: { root: 'app-root', th: 'app-th' } } } })] },
		})

		expect(container.querySelector('.base-table')).toHaveAttribute('class', 'base-table app-root')
		expect(part(container, 'th')).toHaveAttribute('class', 'base-table__th app-th own-th base-table__th--expand')
	})
})

describe('BaseTable: части вне таблицы', () => {
	const TOOLBAR_PROPS: BaseTableToolbarProps = {
		showToolbar: true,
		hasSearch: false,
		hasFilters: false,
		hasColumnSettings: false,
		searchQuery: '',
		filterColumn: '',
		filterOperator: 'eq',
		filterValue: '',
		filterValueTo: '',
		filterValues: [],
		filterKind: 'text',
		filterSelectOptions: [],
		isRangeOperator: false,
		canAddFilter: true,
		filterColumnOptions: [],
		filterOperatorOptions: [],
		activeFilters: [{ key: 'city', operator: 'eq', value: 'Москва' }],
		columns: COLUMNS,
		isSettingsOpen: false,
		exportItems: [],
		isExportOpen: false,
		sizeScale: 100,
		getFilterLabel: () => 'Город = Москва',
	}

	it('панель получает классы от таблицы через provide', () => {
		const Host = defineComponent({
			setup() {
				provide(TABLE_UI_KEY, useUi<BaseTablePart>({ ui: { toolbar: 'u-toolbar', 'active-filters': 'u-filters' } }, 'base-table'))
				return () => h(BaseTableToolbar, TOOLBAR_PROPS)
			},
		})
		const { container } = render(Host)

		expect(part(container, 'toolbar')).toHaveAttribute('class', 'base-table__toolbar u-toolbar')
		expect(part(container, 'active-filters')).toHaveAttribute('class', 'base-table__active-filters u-filters')
	})

	it('без таблицы-родителя — только классы кита', async () => {
		const { container } = render(BaseTableToolbar, { props: TOOLBAR_PROPS })
		await nextTick()

		expect(part(container, 'toolbar')).toHaveAttribute('class', 'base-table__toolbar')
		expect(part(container, 'active-filters')).toHaveAttribute('class', 'base-table__active-filters')
	})
})
