import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BasePagination from '../ui/BasePagination.vue'

const props = { modelValue: 5, total: 200 }

describe('BasePagination: проп ui', () => {
	it('без ui — только классы кита', async () => {
		const { container } = render(BasePagination, { props })
		await nextTick()

		expect(container.querySelector('nav')).toHaveAttribute('class', 'base-pagination')
		expect(container.querySelector('.base-pagination__pages')).toHaveAttribute('class', 'base-pagination__pages')
		expect(container.querySelector('.base-pagination__ellipsis')).toHaveAttribute('class', 'base-pagination__ellipsis')
		expect(container.querySelector('.base-pagination__indicator')).toHaveAttribute(
			'class',
			'base-pagination__indicator base-pagination__indicator--instant',
		)
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const { container } = render(BasePagination, {
			props: {
				...props,
				customClass: { root: 'own-root', pages: 'own-pages', button: 'own-button', ellipsis: 'own-ellipsis', prev: 'own-prev' },
				ui: {
					root: 'u-root',
					arrow: 'u-arrow',
					pages: 'u-pages',
					page: 'u-page',
					ellipsis: 'u-ellipsis',
					indicator: 'u-indicator',
				},
			},
		})
		await nextTick()

		expect(container.querySelector('nav')).toHaveClass('base-pagination', 'u-root', 'own-root')
		expect(container.querySelector('.base-pagination__pages')).toHaveClass('u-pages', 'own-pages')
		expect(container.querySelector('.base-pagination__page--current')).toHaveClass('base-pagination__page', 'u-page', 'own-button')
		expect(container.querySelector('.base-pagination__ellipsis')).toHaveClass('u-ellipsis', 'own-ellipsis')
		expect(container.querySelector('.base-pagination__indicator')).toHaveClass('u-indicator')
		const [prev, next] = container.querySelectorAll('.base-pagination__arrow')
		expect(prev).toHaveClass('u-arrow', 'own-prev')
		expect(next).toHaveClass('u-arrow')
	})

	it('классы из defaults.BasePagination.ui плагина склеиваются с классами экземпляра', async () => {
		const { container } = render(BasePagination, {
			props: { ...props, ui: { pages: 'own-pages' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BasePagination: { ui: { root: 'app-root', pages: 'app-pages' } } } })] },
		})
		await nextTick()

		expect(container.querySelector('nav')).toHaveClass('app-root')
		expect(container.querySelector('.base-pagination__pages')).toHaveAttribute('class', 'base-pagination__pages app-pages own-pages')
	})
})
