import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseInfiniteScroll from '../ui/BaseInfiniteScroll.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { InfiniteScrollLoadEvent } from '../types/BaseInfiniteScroll.types'

describe('BaseInfiniteScroll: проп ui и лоадер', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseInfiniteScroll, { props: { mode: 'manual' } })

		expect(container.querySelector('.base-infinite-scroll__sentinel')).toHaveAttribute('class', 'base-infinite-scroll__sentinel')
		expect(container.querySelector('.base-infinite-scroll__footer')).toHaveAttribute('class', 'base-infinite-scroll__footer')
		expect(container.querySelector('.base-infinite-scroll__message')).toHaveAttribute('class', 'base-infinite-scroll__message')
	})

	it('классы частей добавляются к классам кита; лоадер — в Transition на токенах', async () => {
		const events: InfiniteScrollLoadEvent[] = []
		const ui = { root: 'u-root', sentinel: 'u-sentinel', footer: 'u-footer', loader: 'u-loader', message: 'u-message' }
		const { container } = render(BaseInfiniteScroll, {
			props: {
				mode: 'manual',
				customClass: { root: 'own-root', status: 'own-status' },
				ui,
				onLoad: (event: InfiniteScrollLoadEvent) => events.push(event),
			},
		})

		expect(container.querySelector('.base-infinite-scroll')).toHaveClass('base-infinite-scroll', 'u-root', 'own-root')
		expect(container.querySelector('.base-infinite-scroll__sentinel')).toHaveClass('u-sentinel')
		expect(container.querySelector('.base-infinite-scroll__footer')).toHaveClass('u-footer', 'own-status')
		expect(container.querySelector('.base-infinite-scroll__message')).toHaveClass('u-message')
		expect(container.querySelector('transition-stub')).toHaveAttribute('name', 'base-infinite-scroll-loader')

		await fireEvent.click(screen.getByRole('button', { name: 'Загрузить еще' }))
		expect(container.querySelector('transition-stub .base-infinite-scroll__loader')).toHaveClass('u-loader')
		events[0].done('ok')
		await vi.waitFor(() => expect(container.querySelector('.base-infinite-scroll__loader')).toBeNull())
	})

	it('классы из defaults.BaseInfiniteScroll.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseInfiniteScroll, {
			props: { mode: 'manual', ui: { footer: 'own-footer' } },
			global: {
				plugins: [createUiKitPlugin({ defaults: { BaseInfiniteScroll: { ui: { root: 'app-root', footer: 'app-footer' } } } })],
			},
		})

		expect(container.querySelector('.base-infinite-scroll')).toHaveClass('base-infinite-scroll', 'app-root')
		expect(container.querySelector('.base-infinite-scroll__footer')).toHaveAttribute(
			'class',
			'base-infinite-scroll__footer app-footer own-footer',
		)
	})
})
