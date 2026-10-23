import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import { BaseInput } from '@components/BaseInput'
import BaseTableToolbar from '../../ui/toolbar/BaseTableToolbar.vue'
import type { BaseTableToolbarProps } from '../../types/toolbar/BaseTableToolbar.types'

const PROPS: BaseTableToolbarProps = {
	showToolbar: true,
	hasSearch: true,
	hasFilters: true,
	hasColumnSettings: false,
	searchQuery: '',
	filterColumn: 'name',
	filterOperator: 'contains',
	filterValue: '',
	filterValueTo: '',
	filterValues: [],
	filterKind: 'text',
	filterSelectOptions: [],
	isRangeOperator: false,
	canAddFilter: true,
	filterColumnOptions: [{ value: 'name', label: 'Имя' }],
	filterOperatorOptions: [{ value: 'contains', label: 'Содержит' }],
	activeFilters: [],
	columns: [],
	isSettingsOpen: false,
	exportItems: [],
	isExportOpen: false,
	sizeScale: 100,
	getFilterLabel: () => '',
}

describe('BaseTable: тулбар, ввод через IME', () => {
	it.each([
		['Chrome и Firefox: isComposing', { isComposing: true }],
		['Safari: keyCode 229', { keyCode: 229 }],
	] as const)('%s: Enter, подтверждающий слово в поле значения фильтра, не добавляет фильтр', (_name, init) => {
		const wrapper = mount(BaseTableToolbar, { props: PROPS, attachTo: document.body })
		const field = wrapper.findAllComponents(BaseInput).find(input => input.props('label') === 'Значение фильтра')!

		field.vm.$emit('keydown', new KeyboardEvent('keydown', { key: 'Enter', ...init }))
		expect(wrapper.emitted('add-filter')).toBeUndefined()

		field.vm.$emit('keydown', new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }))
		expect(wrapper.emitted('add-filter')).toHaveLength(1)

		field.vm.$emit('keydown', new KeyboardEvent('keydown', { key: 'a' }))
		expect(wrapper.emitted('add-filter')).toHaveLength(1)
		wrapper.unmount()
	})
})
