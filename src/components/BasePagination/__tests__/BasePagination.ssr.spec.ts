import '@testing-library/jest-dom/vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import BasePagination from '../ui/BasePagination.vue'
import { render, waitFor } from '@testing-library/vue'

const PROPS = { modelValue: 2, total: 50, pageSize: 10 }

describe('BasePagination SSR: запасной вид активного пункта до первого замера', () => {
	it('разметка сервера без индикатора и без класса готовности: активный пункт рисует подложку сам', async () => {
		const html = await renderToString(createSSRApp({ render: () => h(BasePagination, PROPS) }))

		expect(html).not.toContain('base-pagination__indicator')
		expect(html).not.toContain('base-pagination__pages--ready')
	})

	it('после монтирования и замера появляются индикатор и класс готовности', async () => {
		const { container } = render(BasePagination, { props: PROPS })

		await waitFor(() => expect(container.querySelector('.base-pagination__indicator')).toBeInTheDocument())
		expect(container.querySelector('.base-pagination__pages')).toHaveClass('base-pagination__pages--ready')
	})
})
