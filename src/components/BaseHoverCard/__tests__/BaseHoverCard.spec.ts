import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseHoverCard from '../ui/BaseHoverCard.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

const SLOTS = {
	trigger: '<a href="#profile">Профиль</a>',
	default: '<p>Карточка</p>',
}

type Rendered = ReturnType<typeof render>

function trigger(container: Element): HTMLElement {
	return container.querySelector('.base-hover-card__trigger') as HTMLElement
}

function inner(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>('.base-hover-card__inner')
}

function count(rendered: Rendered, name: string): number {
	return rendered.emitted()[name]?.length ?? 0
}

async function advance(ms: number): Promise<void> {
	await vi.advanceTimersByTimeAsync(ms)
	await nextTick()
}

async function openByHover(rendered: Rendered): Promise<void> {
	await fireEvent.pointerEnter(trigger(rendered.container), { pointerType: 'mouse' })
	await advance(300)
}

describe('BaseHoverCard unit', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
		document.body.innerHTML = ''
	})

	describe('рендер и пропсы', () => {
		it('закрытая карточка показывает триггер и не показывает содержимое', () => {
			const { container } = render(BaseHoverCard, { slots: SLOTS })
			expect(screen.getByRole('link', { name: 'Профиль' })).toBeInTheDocument()
			expect(trigger(container)).toBeInTheDocument()
			expect(inner()).toBeNull()
		})

		it('isOpen=true открывает карточку сразу, слот trigger получает isOpen', () => {
			render(BaseHoverCard, {
				props: { isOpen: true },
				slots: {
					trigger: ({ isOpen }: { isOpen: boolean }) => h('a', { href: '#x' }, isOpen ? 'открыта' : 'закрыта'),
					default: '<p>Карточка</p>',
				},
			})
			expect(screen.getByText('Карточка')).toBeInTheDocument()
			expect(screen.getByText('открыта')).toBeInTheDocument()
		})

		it('смена пропса isOpen синхронизируется', async () => {
			const { rerender } = render(BaseHoverCard, { slots: SLOTS })
			await rerender({ isOpen: true })
			expect(screen.getByText('Карточка')).toBeInTheDocument()
			await rerender({ isOpen: false })
			await advance(500)
			expect(screen.queryByText('Карточка')).not.toBeInTheDocument()
		})

		it('isOpen=true при isDisabled не открывает', () => {
			render(BaseHoverCard, { props: { isOpen: true, isDisabled: true }, slots: SLOTS })
			expect(screen.queryByText('Карточка')).not.toBeInTheDocument()
		})

		it('variant ghost без стрелки, остальные со стрелкой, класс варианта у панели', () => {
			const ghost = render(BaseHoverCard, { props: { isOpen: true, variant: 'ghost' }, slots: SLOTS })
			expect(document.body.querySelector('.base-hover-card__panel--ghost')).toBeInTheDocument()
			expect(document.body.querySelector('.base-dropdown__arrow')).toBeNull()
			ghost.unmount()
			render(BaseHoverCard, { props: { isOpen: true, variant: 'outline' }, slots: SLOTS })
			expect(document.body.querySelector('.base-hover-card__panel--outline')).toBeInTheDocument()
			expect(document.body.querySelector('.base-dropdown__arrow')).toBeInTheDocument()
		})

		it('maxHeight ограничивает панель', () => {
			render(BaseHoverCard, { props: { isOpen: true, maxHeight: '200px' }, slots: SLOTS })
			expect(document.body.querySelector<HTMLElement>('.base-dropdown__panel')?.style.maxHeight).toBe('200px')
		})

		it('customClass и ui добавляются элементам', () => {
			const { container } = render(BaseHoverCard, {
				props: {
					isOpen: true,
					customClass: { root: 'c-root', trigger: 'c-trigger', arrow: 'c-arrow', inner: 'c-inner', panel: 'c-panel' },
					ui: { root: 'u-root', trigger: 'u-trigger', arrow: 'u-arrow', inner: 'u-inner', panel: 'u-panel' },
				},
				slots: SLOTS,
			})
			expect(trigger(container)).toHaveClass('c-trigger', 'u-trigger')
			expect(inner()).toHaveClass('c-inner', 'u-inner')
			expect(document.body.querySelector('.c-panel.u-panel')).toBeInTheDocument()
			expect(document.body.querySelector('.c-arrow.u-arrow')).toBeInTheDocument()
			expect(document.body.querySelector('.c-root.u-root')).toBeInTheDocument()
		})

		it('defaults.BaseHoverCard плагина: openDelay 0 открывает сразу', async () => {
			const { container } = render(BaseHoverCard, {
				slots: SLOTS,
				global: { plugins: [createUiKitPlugin({ defaults: { BaseHoverCard: { openDelay: 0 } } })] },
			})
			await fireEvent.pointerEnter(trigger(container), { pointerType: 'mouse' })
			await nextTick()
			expect(screen.getByText('Карточка')).toBeInTheDocument()
		})
	})

	describe('наведение мыши', () => {
		it('pointerenter открывает через openDelay, но не раньше', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await fireEvent.pointerEnter(trigger(rendered.container), { pointerType: 'mouse' })
			await advance(299)
			expect(inner()).toBeNull()
			await advance(1)
			expect(screen.getByText('Карточка')).toBeInTheDocument()
			expect(count(rendered, 'open')).toBe(1)
			expect(rendered.emitted()['update:isOpen']).toEqual([[true]])
		})

		it('pointerleave до открытия отменяет открытие', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await fireEvent.pointerEnter(trigger(rendered.container), { pointerType: 'mouse' })
			await advance(100)
			await fireEvent.pointerLeave(trigger(rendered.container), { pointerType: 'mouse' })
			await advance(1000)
			expect(inner()).toBeNull()
			expect(count(rendered, 'open')).toBe(0)
		})

		it('pointerleave при открытой закрывает через closeDelay', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await openByHover(rendered)
			await fireEvent.pointerLeave(trigger(rendered.container), { pointerType: 'mouse' })
			await advance(149)
			expect(count(rendered, 'close')).toBe(0)
			await advance(1)
			expect(count(rendered, 'close')).toBe(1)
			expect(rendered.emitted()['update:isOpen']).toEqual([[true], [false]])
		})

		it('наведение на карточку отменяет закрытие, уход с карточки закрывает', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await openByHover(rendered)
			await fireEvent.pointerLeave(trigger(rendered.container), { pointerType: 'mouse' })
			await advance(100)
			await fireEvent.pointerEnter(inner() as HTMLElement, { pointerType: 'mouse' })
			await advance(1000)
			expect(count(rendered, 'close')).toBe(0)
			await fireEvent.pointerLeave(inner() as HTMLElement, { pointerType: 'mouse' })
			await advance(150)
			expect(count(rendered, 'close')).toBe(1)
		})

		it('isDisabled: наведение не открывает', async () => {
			const rendered = render(BaseHoverCard, { props: { isDisabled: true }, slots: SLOTS })
			await openByHover(rendered)
			await advance(1000)
			expect(inner()).toBeNull()
			expect(count(rendered, 'open')).toBe(0)
		})

		it('изменение isDisabled на true закрывает открытую карточку', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await openByHover(rendered)
			await rendered.rerender({ isDisabled: true })
			expect(count(rendered, 'close')).toBe(1)
			expect(rendered.emitted()['update:isOpen']).toEqual([[true], [false]])
		})

		it('смена isDisabled на true у закрытой карточки ничего не эмитит', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await rendered.rerender({ isDisabled: true })
			expect(count(rendered, 'close')).toBe(0)
		})
	})

	describe('касание', () => {
		it('pointerenter и pointerleave с pointerType touch игнорируются', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await fireEvent.pointerEnter(trigger(rendered.container), { pointerType: 'touch' })
			await advance(1000)
			expect(inner()).toBeNull()
			await openByHover(rendered)
			await fireEvent.pointerLeave(trigger(rendered.container), { pointerType: 'touch' })
			await advance(1000)
			expect(count(rendered, 'close')).toBe(0)
		})

		it('pointerdown touch и click переключают карточку сразу', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			const area = trigger(rendered.container)
			await fireEvent.pointerDown(area, { pointerType: 'touch' })
			await fireEvent.click(area)
			await nextTick()
			expect(screen.getByText('Карточка')).toBeInTheDocument()
			await fireEvent.pointerDown(area, { pointerType: 'touch' })
			await fireEvent.click(area)
			expect(count(rendered, 'close')).toBe(1)
		})

		it('click мышью ничего не делает', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			const area = trigger(rendered.container)
			await fireEvent.pointerDown(area, { pointerType: 'mouse' })
			await fireEvent.click(area)
			await advance(1000)
			expect(inner()).toBeNull()
		})

		it('focusin после касания игнорируется', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await fireEvent.pointerDown(trigger(rendered.container), { pointerType: 'touch' })
			await fireEvent.focusIn(screen.getByRole('link', { name: 'Профиль' }))
			await advance(1000)
			expect(inner()).toBeNull()
		})

		it('касание, затем Tab: фокус с клавиатуры открывает карточку сразу', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			const area = trigger(rendered.container)
			await fireEvent.pointerDown(area, { pointerType: 'touch' })
			await fireEvent.keyDown(area, { key: 'Tab' })
			await fireEvent.focusIn(screen.getByRole('link', { name: 'Профиль' }))
			await nextTick()
			expect(screen.getByText('Карточка')).toBeInTheDocument()
		})
	})

	describe('клавиатура и фокус', () => {
		it('касание, уход фокуса (focusout), затем фокус с другого элемента открывает карточку', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			const link = screen.getByRole('link', { name: 'Профиль' })
			await fireEvent.pointerDown(trigger(rendered.container), { pointerType: 'touch' })
			await fireEvent.focusIn(link)
			await fireEvent.focusOut(link, { relatedTarget: document.body })
			await fireEvent.focusIn(link)
			await nextTick()
			expect(screen.getByText('Карточка')).toBeInTheDocument()
		})

		it('focusin на триггер открывает сразу', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await fireEvent.focusIn(screen.getByRole('link', { name: 'Профиль' }))
			await nextTick()
			expect(screen.getByText('Карточка')).toBeInTheDocument()
			expect(count(rendered, 'open')).toBe(1)
		})

		it('focusout наружу закрывает через closeDelay', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			const link = screen.getByRole('link', { name: 'Профиль' })
			await fireEvent.focusIn(link)
			await fireEvent.focusOut(link, { relatedTarget: document.body })
			await advance(149)
			expect(count(rendered, 'close')).toBe(0)
			await advance(1)
			expect(count(rendered, 'close')).toBe(1)
		})

		it('focusout без relatedTarget закрывает', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			const link = screen.getByRole('link', { name: 'Профиль' })
			await fireEvent.focusIn(link)
			await fireEvent.focusOut(link)
			await advance(150)
			expect(count(rendered, 'close')).toBe(1)
		})

		it('focusout в пределах триггера не закрывает', async () => {
			const rendered = render(BaseHoverCard, {
				slots: { trigger: '<a href="#a">Один</a><a href="#b">Два</a>', default: '<p>Карточка</p>' },
			})
			const first = screen.getByRole('link', { name: 'Один' })
			await fireEvent.focusIn(first)
			await fireEvent.focusOut(first, { relatedTarget: screen.getByRole('link', { name: 'Два' }) })
			await advance(1000)
			expect(count(rendered, 'close')).toBe(0)
		})

		it('focusin внутрь карточки отменяет закрытие, focusout из карточки наружу закрывает', async () => {
			const rendered = render(BaseHoverCard, {
				slots: { trigger: '<a href="#a">Профиль</a>', default: '<button type="button">Действие</button>' },
			})
			const link = screen.getByRole('link', { name: 'Профиль' })
			await fireEvent.focusIn(link)
			await nextTick()
			const button = screen.getByRole('button', { name: 'Действие' })
			await fireEvent.focusOut(link, { relatedTarget: document.body })
			await advance(100)
			await fireEvent.focusIn(button)
			await advance(1000)
			expect(count(rendered, 'close')).toBe(0)
			await fireEvent.focusOut(button, { relatedTarget: document.body })
			await advance(150)
			expect(count(rendered, 'close')).toBe(1)
		})

		it('focusout без relatedTarget (окно потеряло фокус), пока фокус остаётся внутри карточки, не закрывает; после ухода фокуса закрывает', async () => {
			const rendered = render(BaseHoverCard, {
				slots: {
					trigger: '<a href="#a">Профиль</a>',
					default: '<button type="button">Первая</button><button type="button">Вторая</button>',
				},
			})
			const link = screen.getByRole('link', { name: 'Профиль' })
			await fireEvent.focusIn(link)
			await nextTick()
			const first = screen.getByRole('button', { name: 'Первая' })
			const second = screen.getByRole('button', { name: 'Вторая' })
			first.focus()
			await fireEvent.focusIn(first)
			await fireEvent.focusOut(first, { relatedTarget: second })
			await fireEvent.focusIn(second)
			second.focus()
			await fireEvent.focusOut(second)
			await advance(1000)
			expect(count(rendered, 'close')).toBe(0)

			second.blur()
			await fireEvent.focusOut(second)
			await advance(150)
			expect(count(rendered, 'close')).toBe(1)
		})

		it('focusout триггера без relatedTarget при closeDelay=0 тоже учитывает фокус внутри карточки', async () => {
			const rendered = render(BaseHoverCard, {
				props: { closeDelay: 0 },
				slots: { trigger: '<a href="#a">Профиль</a>', default: '<button type="button">Действие</button>' },
			})
			const link = screen.getByRole('link', { name: 'Профиль' })
			await fireEvent.focusIn(link)
			await nextTick()
			screen.getByRole('button', { name: 'Действие' }).focus()
			await fireEvent.focusOut(link)
			await advance(10)
			expect(count(rendered, 'close')).toBe(0)
		})

		it('focusout из карточки на триггер не закрывает', async () => {
			const rendered = render(BaseHoverCard, {
				slots: { trigger: '<a href="#a">Профиль</a>', default: '<button type="button">Действие</button>' },
			})
			const link = screen.getByRole('link', { name: 'Профиль' })
			await fireEvent.focusIn(link)
			await nextTick()
			const button = screen.getByRole('button', { name: 'Действие' })
			await fireEvent.focusOut(button, { relatedTarget: link })
			await advance(1000)
			expect(count(rendered, 'close')).toBe(0)
		})

		it('pointerleave с карточки при касании не закрывает', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await openByHover(rendered)
			await fireEvent.pointerLeave(inner() as HTMLElement, { pointerType: 'touch' })
			await advance(1000)
			expect(count(rendered, 'close')).toBe(0)
		})

		it('Escape закрывает открытую карточку и отменяет таймер', async () => {
			const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await openByHover(rendered)
			await fireEvent.pointerLeave(trigger(rendered.container), { pointerType: 'mouse' })
			await user.keyboard('{Escape}')
			await advance(1000)
			expect(rendered.emitted()['update:isOpen']).toEqual([[true], [false]])
			expect(count(rendered, 'close')).toBe(1)
		})
	})

	describe('aria и жизненный цикл', () => {
		it('первый фокусируемый элемент получает aria-describedby на время показа', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			const link = screen.getByRole('link', { name: 'Профиль' })
			expect(link).not.toHaveAttribute('aria-describedby')
			await openByHover(rendered)
			expect(link).toHaveAttribute('aria-describedby', (inner() as HTMLElement).id)
			await fireEvent.pointerLeave(trigger(rendered.container), { pointerType: 'mouse' })
			await advance(150)
			expect(link).not.toHaveAttribute('aria-describedby')
		})

		it('триггер без фокусируемого элемента получает tabindex 0', () => {
			render(BaseHoverCard, { slots: { trigger: '<span>Подсказка</span>', default: '<p>Карточка</p>' } })
			expect(screen.getByText('Подсказка')).toHaveAttribute('tabindex', '0')
		})

		it('размонтирование очищает таймер', async () => {
			const rendered = render(BaseHoverCard, { slots: SLOTS })
			await fireEvent.pointerEnter(trigger(rendered.container), { pointerType: 'mouse' })
			rendered.unmount()
			await advance(1000)
			expect(count(rendered, 'open')).toBe(0)
		})
	})
})
