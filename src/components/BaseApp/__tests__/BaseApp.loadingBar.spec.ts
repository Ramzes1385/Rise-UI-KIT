import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import BaseApp from '../ui/BaseApp.vue'
import { setLocale } from '@/locales/state'
import { render, screen } from '@testing-library/vue'
import type { BaseAppLoadingBarOptions } from '../types/BaseApp.types'
import { LOADING_BAR_HIDE_MS, LOADING_BAR_START, loadingBarStore, useLoadingBar } from '@composables/app/useLoadingBar'

function renderApp(loadingBar?: BaseAppLoadingBarOptions) {
	return render(BaseApp, { props: { loadingBar }, slots: { default: () => h('main', 'Приложение') } })
}

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	loadingBarStore.reset()
	vi.useRealTimers()
	setLocale('ru')
})

describe('BaseApp: полоса загрузки', () => {
	it('без загрузки полосы нет', () => {
		renderApp()

		expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
	})

	it('start показывает неопределённую полосу с именем из словаря', async () => {
		renderApp()
		useLoadingBar().start()
		await nextTick()

		const bar = screen.getByRole('progressbar', { name: 'Загрузка страницы' })
		expect(bar).not.toHaveAttribute('aria-valuenow')
		expect(bar).toHaveClass('base-app-loading-bar--loading')
		expect(bar.style.getPropertyValue('--loading-bar-progress')).toBe(String(LOADING_BAR_START))
		expect(bar.style.getPropertyValue('--loading-bar-height')).toBe('3px')
	})

	it('стоит перед приложением, а приложение не оборачивает', async () => {
		const { container } = renderApp()
		useLoadingBar().start()
		await nextTick()

		expect(container.firstElementChild).toBe(screen.getByRole('progressbar'))
		expect(container.querySelector('main')?.parentElement).toBe(container)
	})

	it('показывает загрузку, начатую до монтирования BaseApp', () => {
		useLoadingBar().start()
		renderApp()

		expect(screen.getByRole('progressbar')).toBeInTheDocument()
	})

	it('применяет толщину и имя из пропа loadingBar', async () => {
		renderApp({ height: 5, label: 'Открываем раздел' })
		useLoadingBar().start()
		await nextTick()

		const bar = screen.getByRole('progressbar', { name: 'Открываем раздел' })
		expect(bar.style.getPropertyValue('--loading-bar-height')).toBe('5px')
	})

	it('берёт имя из словаря текущего языка', async () => {
		renderApp()
		setLocale('en')
		useLoadingBar().start()
		await nextTick()

		expect(screen.getByRole('progressbar', { name: 'Page loading' })).toBeInTheDocument()
	})

	it('finish заполняет полосу и убирает её после паузы', async () => {
		renderApp()
		const bar = useLoadingBar()
		bar.start()
		bar.finish()
		await nextTick()

		const element = screen.getByRole('progressbar')
		expect(element).toHaveClass('base-app-loading-bar--done')
		expect(element.style.getPropertyValue('--loading-bar-progress')).toBe('1')

		vi.advanceTimersByTime(LOADING_BAR_HIDE_MS)
		await nextTick()
		expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
	})

	it('error показывает полосу в состоянии ошибки', async () => {
		renderApp()
		const bar = useLoadingBar()
		bar.start()
		bar.error()
		await nextTick()

		expect(screen.getByRole('progressbar')).toHaveClass('base-app-loading-bar', 'base-app-loading-bar--error')
	})
})
