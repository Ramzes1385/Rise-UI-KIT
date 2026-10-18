import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { mockWidth } from '../fixtures/shellFixtures'
import { screen, within } from '@testing-library/vue'
import { renderRoadmap } from '../fixtures/renderRoadmap'

const originalObserver = globalThis.ResizeObserver

function region(): HTMLElement {
	return screen.getByRole('region', { name: 'Фронтенд' })
}

describe('BaseRoadmap: узкий контейнер', () => {
	afterEach(() => {
		globalThis.ResizeObserver = originalObserver
	})

	it('уже narrowWidth (560) включает список, прячет переключатель и легенду', async () => {
		await renderRoadmap({ width: 500, props: { layout: 'snake' } })
		expect(region()).toHaveClass('base-roadmap--narrow')
		expect(region().querySelector('.base-roadmap__area--list')).not.toBeNull()
		expect(screen.queryByRole('radiogroup', { name: 'Раскладка пути' })).not.toBeInTheDocument()
		expect(screen.queryByRole('list', { name: 'Обозначения' })).not.toBeInTheDocument()
		expect(screen.getByRole('radiogroup', { name: 'Какие темы показывать' })).toBeInTheDocument()
	})

	it('на границе 560 контейнер ещё широкий', async () => {
		await renderRoadmap({ width: 560, props: { layout: 'snake' } })
		expect(region()).not.toHaveClass('base-roadmap--narrow')
		expect(region().querySelector('.base-roadmap__area--snake')).not.toBeNull()
		expect(screen.getByRole('list', { name: 'Обозначения' })).toBeInTheDocument()
	})

	it('narrowWidth задаёт порог', async () => {
		await renderRoadmap({ width: 700, props: { narrowWidth: 800 } })
		expect(region()).toHaveClass('base-roadmap--narrow')
	})

	it('narrowLayout: null оставляет выбранную раскладку и переключатель', async () => {
		await renderRoadmap({ width: 400, props: { layout: 'horizontal', narrowLayout: null } })
		expect(region().querySelector('.base-roadmap__area--horizontal')).not.toBeNull()
		expect(screen.getByRole('radiogroup', { name: 'Раскладка пути' })).toBeInTheDocument()
	})

	it('в узком виде вместо кнопки в сводке — нижняя кнопка «Продолжить»', async () => {
		const { user } = await renderRoadmap({ width: 400, props: { detailsPosition: 'sheet' } })
		const buttons = screen.getAllByRole('button', { name: 'Продолжить: HTML' })
		expect(buttons).toHaveLength(1)
		expect(buttons[0].closest('.base-roadmap__cta')).not.toBeNull()
		expect(screen.getByText('0 %')).toBeInTheDocument()
		await user.click(buttons[0])
		expect(await screen.findByRole('dialog', { name: 'HTML' })).toBeInTheDocument()
	})

	it('в узкой сводке часы идут через точку в той же строке', async () => {
		await renderRoadmap({ width: 400 })
		expect(screen.getByText(/0 из 5 тем · осталось ≈ 18 ч/)).toBeInTheDocument()
	})

	it('когда продолжать нечего, нижней кнопки нет', async () => {
		const data = { version: 1, title: 'Готово', stages: [{ id: 's', title: 'Этап', topics: [{ id: 'a', title: 'A' }] }] }
		await renderRoadmap({ width: 400, props: { data, progress: { version: 1, topics: { a: { status: 'done' } } } } })
		expect(screen.queryByRole('button', { name: /Продолжить/ })).not.toBeInTheDocument()
		expect(screen.getByText('1 из 1 темы')).toBeInTheDocument()
	})

	it('меняет вид при изменении размера контейнера', async () => {
		const callbacks: ResizeObserverCallback[] = []
		globalThis.ResizeObserver = class {
			constructor(callback: ResizeObserverCallback) {
				callbacks.push(callback)
			}
			observe() {}
			unobserve() {}
			disconnect() {}
		} as unknown as typeof ResizeObserver
		await renderRoadmap({ width: 1200 })
		expect(region()).not.toHaveClass('base-roadmap--narrow')
		mockWidth(300)
		callbacks.forEach(callback => callback([{ contentRect: { width: 300 } } as ResizeObserverEntry], {} as ResizeObserver))
		await vi.waitFor(() => expect(region()).toHaveClass('base-roadmap--narrow'))
		expect(screen.queryByRole('radiogroup', { name: 'Раскладка пути' })).not.toBeInTheDocument()
	})

	it('скрытый контейнер (ширина 0) считается широким', async () => {
		await renderRoadmap({ width: 0 })
		expect(region()).not.toHaveClass('base-roadmap--narrow')
	})
})

describe('BaseRoadmap: переключатель раскладок', () => {
	it('показывает раскладки реестра и применяет выбранную', async () => {
		const { user } = await renderRoadmap({ props: { layout: 'path' } })
		const group = screen.getByRole('radiogroup', { name: 'Раскладка пути' })
		expect(
			within(group)
				.getAllByRole('radio')
				.map(radio => (radio as HTMLInputElement).value),
		).toEqual(['path', 'snake', 'list', 'horizontal'])
		expect(within(group).getByRole('radio', { name: 'Путь' })).toBeChecked()
		expect(region().querySelector('.base-roadmap__area--path')).not.toBeNull()
		await user.click(within(group).getByRole('radio', { name: 'Змейка' }))
		expect(region().querySelector('.base-roadmap__area--snake')).not.toBeNull()
		await user.click(within(group).getByRole('radio', { name: 'Лента' }))
		expect(region().querySelector('.base-roadmap__area--horizontal')).not.toBeNull()
		await user.click(within(group).getByRole('radio', { name: 'Список' }))
		expect(region().querySelector('.base-roadmap__area--list')).not.toBeNull()
		expect(screen.getByRole('button', { name: /Основы/ })).toBeInTheDocument()
	})

	it('hasLayoutSwitch: false убирает переключатель, раскладка остаётся из пропса', async () => {
		await renderRoadmap({ props: { layout: 'snake', hasLayoutSwitch: false } })
		expect(screen.queryByRole('radiogroup', { name: 'Раскладка пути' })).not.toBeInTheDocument()
		expect(region().querySelector('.base-roadmap__area--snake')).not.toBeNull()
	})

	it('смена пропса layout сбрасывает ручной выбор', async () => {
		const { user, rerender } = await renderRoadmap({ props: { layout: 'path' } })
		await user.click(screen.getByRole('radio', { name: 'Лента' }))
		await rerender({ layout: 'snake' })
		expect(screen.getByRole('radio', { name: 'Змейка' })).toBeChecked()
	})

	it('без переключателя и фильтра панели управления нет', async () => {
		await renderRoadmap({ props: { hasLayoutSwitch: false, hasFilter: false } })
		expect(region().querySelector('.base-roadmap__bar')).toBeNull()
	})

	it('без фильтра переключатель раскладок остаётся без разделителя', async () => {
		await renderRoadmap({ props: { hasFilter: false } })
		expect(screen.getByRole('radiogroup', { name: 'Раскладка пути' })).toBeInTheDocument()
		expect(region().querySelector('.base-roadmap__bar-sep')).toBeNull()
	})
})
