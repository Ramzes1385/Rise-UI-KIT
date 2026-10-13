import '@testing-library/jest-dom/vitest'
import { createSSRApp, h } from 'vue'
import BaseBottomNav from '../ui/BaseBottomNav.vue'
import { renderToString } from 'vue/server-renderer'
import { render, waitFor } from '@testing-library/vue'

const PROPS = {
	modelValue: 'home',
	items: [
		{ value: 'home', label: 'Главная', icon: 'home' },
		{ value: 'search', label: 'Поиск', icon: 'search' },
		{ value: 'user', label: 'Профиль', icon: 'user' },
	],
}

describe('BaseBottomNav SSR: запасной вид активного пункта до первого замера', () => {
	it('разметка сервера без индикатора и без класса готовности: активный пункт рисует подложку сам', async () => {
		const html = await renderToString(createSSRApp({ render: () => h(BaseBottomNav, PROPS) }))

		expect(html).not.toContain('base-bottom-nav__indicator')
		expect(html).not.toContain('base-bottom-nav--indicator-ready')
	})

	it('после монтирования и замера появляются индикатор и класс готовности', async () => {
		const { container } = render(BaseBottomNav, { props: PROPS })

		await waitFor(() => expect(container.querySelector('.base-bottom-nav__indicator')).toBeInTheDocument())
		expect(container.querySelector('.base-bottom-nav')).toHaveClass('base-bottom-nav--indicator-ready')
	})
})
