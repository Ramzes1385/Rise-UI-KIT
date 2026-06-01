/**
 * Integration-тесты для BaseTable.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

import type { TableColumn } from './BaseTable.types'
import BaseTable from './BaseTable.vue'

const globalConfig = {
	stubs: {
		BaseInput: true,
		BaseSelect: true,
		BaseButton: true,
		BaseCheckbox: true,
		BaseText: { template: '<span><slot /></span>' },
		BaseIcon: true,
		BaseLoader: true,
	},
}

describe('BaseTable integration', () => {
	it('должен эмитить sort при клике на заголовок', async () => {
		const user = userEvent.setup()
		const columns: TableColumn[] = [{ key: 'name', label: 'Name', isSortable: true }]
		const { emitted } = render(BaseTable, {
			props: { columns, rows: [] },
			global: globalConfig,
		})

		await user.click(screen.getByText('Name'))
		expect(emitted()).toHaveProperty('sort')
	})
})
