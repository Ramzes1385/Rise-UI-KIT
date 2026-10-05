import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseVirtualList from '../ui/BaseVirtualList.vue'

const ITEMS = Array.from({ length: 50 }, (_, index) => ({ id: index, title: `Заказ № ${index + 1}` }))

beforeAll(() => {
	Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
		configurable: true,
		get(this: HTMLElement) {
			return this.classList.contains('base-virtual-list') ? 100 : 0
		},
	})
})

afterAll(() => {
	delete (HTMLElement.prototype as { clientHeight?: number }).clientHeight
})

const slots = { default: '<template #default="{ item }">{{ item.title }}</template>' }

describe('BaseVirtualList: проп ui', () => {
	it('без ui — только классы кита', async () => {
		const { container } = render(BaseVirtualList, { props: { items: ITEMS }, slots })
		await nextTick()

		expect(container.querySelector('.base-virtual-list__inner')).toHaveAttribute('class', 'base-virtual-list__inner')
		expect(container.querySelector('.base-virtual-list__item')).toHaveAttribute('class', 'base-virtual-list__item')
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', async () => {
		const { container } = render(BaseVirtualList, {
			props: {
				items: ITEMS,
				customClass: { root: 'own-root', item: 'own-item' },
				ui: { root: 'u-root', inner: 'u-inner', item: 'u-item' },
			},
			slots,
		})
		await nextTick()

		expect(container.querySelector('.base-virtual-list')).toHaveClass('base-virtual-list', 'u-root', 'own-root')
		expect(container.querySelector('.base-virtual-list__inner')).toHaveClass('u-inner')
		expect(container.querySelector('.base-virtual-list__item')).toHaveClass('u-item', 'own-item')
	})

	it('классы из defaults.BaseVirtualList.ui плагина склеиваются с классами экземпляра', async () => {
		const { container } = render(BaseVirtualList, {
			props: { items: ITEMS, ui: { item: 'own-item' } },
			slots,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseVirtualList: { ui: { root: 'app-root', item: 'app-item' } } } })] },
		})
		await nextTick()

		expect(container.querySelector('.base-virtual-list')).toHaveClass('base-virtual-list', 'app-root')
		expect(container.querySelector('.base-virtual-list__item')).toHaveAttribute('class', 'base-virtual-list__item app-item own-item')
	})
})
