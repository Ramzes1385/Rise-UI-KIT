import '@testing-library/jest-dom/vitest'
import { createSSRApp, h } from 'vue'
import BaseAnchor from '../ui/BaseAnchor.vue'
import { renderToString } from 'vue/server-renderer'
import { render, waitFor } from '@testing-library/vue'

const PROPS = {
	variant: 'soft' as const,
	items: [
		{ id: 'one', label: 'Один' },
		{ id: 'two', label: 'Два' },
	],
}

describe('BaseAnchor SSR: запасной вид активного пункта до первого замера', () => {
	it('разметка сервера без индикатора и без класса готовности: активный пункт рисует подложку сам', async () => {
		const html = await renderToString(createSSRApp({ render: () => h(BaseAnchor, PROPS) }))

		expect(html).not.toContain('base-anchor__indicator')
		expect(html).not.toContain('base-anchor--indicator-ready')
	})

	it('после монтирования и замера появляются индикатор и класс готовности', async () => {
		const { container } = render(BaseAnchor, { props: PROPS })

		await waitFor(() => expect(container.querySelector('.base-anchor__indicator')).toBeInTheDocument())
		expect(container.querySelector('.base-anchor')).toHaveClass('base-anchor--indicator-ready')
	})

	it.each(['vertical', 'horizontal'] as const)(
		'направление %s: разметка сервера без индикатора и класса готовности — запасной вид рисуют стили',
		async direction => {
			const html = await renderToString(createSSRApp({ render: () => h(BaseAnchor, { ...PROPS, variant: 'default', direction }) }))

			expect(html).not.toContain('base-anchor__indicator')
			expect(html).not.toContain('base-anchor--indicator-ready')
			expect(html).toContain(`base-anchor--${direction}`)
		},
	)
})
