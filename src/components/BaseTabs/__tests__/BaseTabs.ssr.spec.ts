import '@testing-library/jest-dom/vitest'
import { createSSRApp, h } from 'vue'
import BaseTabs from '../ui/BaseTabs.vue'
import { renderToString } from 'vue/server-renderer'
import { render, waitFor } from '@testing-library/vue'

const PROPS = {
	modelValue: 'a',
	variant: 'pills' as const,
	items: [
		{ id: 'a', label: 'А' },
		{ id: 'b', label: 'Б' },
	],
}

describe('BaseTabs SSR: запасной вид активного пункта до первого замера', () => {
	it('разметка сервера без индикатора и без класса готовности: активный пункт рисует подложку сам', async () => {
		const html = await renderToString(createSSRApp({ render: () => h(BaseTabs, PROPS) }))

		expect(html).not.toContain('base-tabs__indicator')
		expect(html).not.toContain('base-tabs--indicator-ready')
	})

	it('после монтирования и замера появляются индикатор и класс готовности', async () => {
		const { container } = render(BaseTabs, { props: PROPS })

		await waitFor(() => expect(container.querySelector('.base-tabs__indicator')).toBeInTheDocument())
		expect(container.querySelector('.base-tabs')).toHaveClass('base-tabs--indicator-ready')
	})
})
