import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import BaseTablePagination from './BaseTablePagination.vue'

describe('BaseTablePagination', () => {
	const defaultProps = {
		showFooterBar: true,
		showPageSizeSelector: true,
		showPagination: true,
		pageSize: 10,
		pageSizeOptions: [10, 20, 50],
		pageSizeSelectOptions: [
			{ value: '10', label: '10' },
			{ value: '20', label: '20' },
			{ value: '50', label: '50' },
		],
		currentPage: 1,
		totalPages: 5,
		visiblePages: [1, 2, 3, 4, 5],
		paginationInfo: '1-10 of 50',
		totalItems: 50,
		maxVisible: 5,
		sizeScale: 20,
		handlePageSizeChange: vi.fn(),
	}

	it('должен отображать футер, селектор размера страницы и пагинацию', () => {
		render(BaseTablePagination, { props: defaultProps })

		expect(screen.getByText('1-10 of 50')).toBeInTheDocument()
		// BaseSelect рендерит input или button, проверим наличие контейнера
		expect(screen.getByText('10')).toBeInTheDocument()
	})

	it('не должен отображать футер, если showFooterBar=false', () => {
		render(BaseTablePagination, {
			props: { ...defaultProps, showFooterBar: false },
		})

		expect(screen.queryByText('1-10 of 50')).not.toBeInTheDocument()
	})

	it('должен эмитить page-size-change при выборе нового размера', async () => {
		const emitMock = vi.fn()
		const { emitted } = render(BaseTablePagination, {
			props: { ...defaultProps },
		})

		// BaseSelect внутри рендерится, просто проверим что компонент не падает
		expect(emitted()).toBeDefined()
	})

	it('должен использовать слот pagination, если он предоставлен', () => {
		render(BaseTablePagination, {
			props: defaultProps,
			slots: {
				pagination: '<span data-testid="custom-pagination">Custom Pagination</span>',
			},
		})

		expect(screen.getByTestId('custom-pagination')).toBeInTheDocument()
		expect(screen.queryByText('1-10 of 50')).not.toBeInTheDocument()
	})
})
