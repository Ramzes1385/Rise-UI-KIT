/**
 * Unit-тесты BaseDrawer: диалог и его имя, закрытие (кнопка, затемнение, Escape), края окна,
 * перетаскивание к краю. Панель телепортируется — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseDrawer from '../ui/BaseDrawer.vue'

function panel(): HTMLElement {
	return document.querySelector('.base-drawer__panel') as HTMLElement
}

function setup(props: Record<string, unknown> = {}, slots: Record<string, string> = { default: '<p>Фильтры заказов</p>' }) {
	return render(BaseDrawer, { props: { isOpen: true, title: 'Фильтры', ...props }, slots })
}

describe('BaseDrawer unit', () => {
	it('закрытая панель не рендерится', () => {
		render(BaseDrawer, { props: { isOpen: false } })
		expect(document.querySelector('.base-drawer')).not.toBeInTheDocument()
	})

	it('открытая — модальный диалог с именем из заголовка, описанием, ручкой и подвалом', () => {
		setup({ description: 'Показываются заказы за месяц' }, { default: 'Тело', footer: '<button>Применить</button>' })
		const dialog = screen.getByRole('dialog', { name: 'Фильтры' })
		expect(dialog).toHaveAttribute('aria-modal', 'true')
		expect(dialog).toHaveAccessibleDescription('Показываются заказы за месяц')
		expect(dialog).toHaveClass('base-drawer__panel--bottom')
		expect(document.querySelector('.base-drawer__handle')).toHaveAttribute('aria-hidden', 'true')
		expect(screen.getByRole('button', { name: 'Применить' }).closest('footer')).toBeInTheDocument()
	})

	it('без заголовка — имя из ariaLabel; слот header заменяет заголовок', () => {
		const { unmount } = render(BaseDrawer, { props: { isOpen: true, ariaLabel: 'Корзина', hasHandle: false } })
		expect(screen.getByRole('dialog', { name: 'Корзина' })).toBeInTheDocument()
		expect(document.querySelector('.base-drawer__handle')).not.toBeInTheDocument()
		expect(document.querySelector('.base-drawer__header')).not.toBeInTheDocument()
		unmount()
		render(BaseDrawer, { props: { isOpen: true, ariaLabel: 'Корзина' }, slots: { header: '<strong>3 товара</strong>' } })
		expect(screen.getByRole('dialog', { name: 'Корзина' })).not.toHaveAttribute('aria-labelledby')
		expect(screen.getByText('3 товара')).toBeInTheDocument()
	})

	it('кнопка «Закрыть», затемнение и Escape закрывают панель', async () => {
		const { emitted } = setup()
		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
		await fireEvent.click(document.querySelector('.base-drawer') as HTMLElement)
		await fireEvent.keyDown(document, { key: 'Escape' })
		expect(emitted()['update:isOpen']).toEqual([[false], [false], [false]])
		expect(emitted().close).toHaveLength(3)
	})

	it('closeOnOverlay=false и hasOverlay=false', async () => {
		const { emitted } = setup({ closeOnOverlay: false, hasOverlay: false, direction: 'left' })
		const root = document.querySelector('.base-drawer') as HTMLElement
		expect(root).toHaveClass('base-drawer--no-overlay', 'base-drawer--left')
		await fireEvent.click(root)
		expect(emitted()['update:isOpen']).toBeUndefined()
	})

	it('перетаскивание вниз дальше четверти высоты закрывает панель', async () => {
		const { emitted, rerender } = setup()
		Object.defineProperty(panel(), 'offsetHeight', { value: 400, configurable: true })
		const handle = document.querySelector('.base-drawer__handle') as HTMLElement
		await fireEvent.pointerDown(handle, { button: 0, clientY: 100, pointerId: 1 })
		expect(document.querySelector('.base-drawer')).toHaveClass('base-drawer--dragging')
		await fireEvent.pointerMove(panel(), { clientY: 60 })
		expect(panel().style.transform).toBe('translateY(0px)')
		await fireEvent.pointerMove(panel(), { clientY: 300 })
		expect(panel().style.transform).toBe('translateY(200px)')
		await fireEvent.pointerUp(panel())
		expect(emitted()['update:isOpen']).toEqual([[false]])
		expect(panel().style.transform).toBe('translateY(100%)')
		await rerender({ isOpen: true, title: 'Фильтры' })
		await rerender({ isOpen: false })
		expect(document.querySelector('.base-drawer')).not.toBeInTheDocument()
	})

	it('короткое перетаскивание за шапку возвращает панель', async () => {
		const { emitted } = setup()
		Object.defineProperty(panel(), 'offsetHeight', { value: 400, configurable: true })
		await fireEvent.pointerDown(screen.getByRole('heading', { name: 'Фильтры' }), { button: 0, clientY: 100 })
		await fireEvent.pointerMove(panel(), { clientY: 150 })
		await fireEvent.pointerUp(panel())
		expect(emitted()['update:isOpen']).toBeUndefined()
		expect(panel().style.transform).toBe('')
	})

	it('не тянут: тело, кнопка в шапке, правая кнопка мыши, isDraggable=false; pointercancel сбрасывает', async () => {
		const { rerender } = setup()
		await fireEvent.pointerDown(screen.getByText('Фильтры заказов'), { button: 0, clientY: 0 })
		await fireEvent.pointerDown(screen.getByRole('button', { name: 'Закрыть' }), { button: 0, clientY: 0 })
		await fireEvent.pointerDown(document.querySelector('.base-drawer__handle') as HTMLElement, { button: 2, clientY: 0 })
		await fireEvent.pointerMove(panel(), { clientY: 300 })
		await fireEvent.pointerUp(panel())
		expect(panel().style.transform).toBe('')
		await fireEvent.pointerDown(document.querySelector('.base-drawer__handle') as HTMLElement, { button: 0, clientY: 0 })
		await fireEvent.pointerCancel(panel())
		expect(document.querySelector('.base-drawer')).not.toHaveClass('base-drawer--dragging')
		await rerender({ isOpen: true, title: 'Фильтры', isDraggable: false })
		await fireEvent.pointerDown(document.querySelector('.base-drawer__handle') as HTMLElement, { button: 0, clientY: 0 })
		expect(document.querySelector('.base-drawer')).not.toHaveClass('base-drawer--dragging')
	})

	it.each([
		{ direction: 'top', axis: 'clientY', delta: -120, transform: 'translateY(-120px)' },
		{ direction: 'left', axis: 'clientX', delta: -60, transform: 'translateX(-60px)' },
		{ direction: 'right', axis: 'clientX', delta: 60, transform: 'translateX(60px)' },
	] as const)('край $direction: тянется к своему краю', async ({ direction, axis, delta, transform }) => {
		const { emitted } = setup({ direction })
		Object.defineProperty(panel(), 'offsetWidth', { value: 300, configurable: true })
		await fireEvent.pointerDown(document.querySelector('.base-drawer__handle') as HTMLElement, { button: 0, [axis]: 200 })
		await fireEvent.pointerMove(panel(), { [axis]: 200 + delta })
		expect(panel().style.transform).toBe(transform)
		await fireEvent.pointerUp(panel())
		expect(emitted()['update:isOpen']).toEqual(direction === 'top' ? [[false]] : undefined)
	})
})
