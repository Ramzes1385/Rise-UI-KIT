import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseTransfer from '../ui/BaseTransfer.vue'
import type { ListItem } from '@components/BaseList'
import { render, screen, waitFor, within } from '@testing-library/vue'

const ITEMS: ListItem[] = [
	{ id: 'a', title: 'Анна' },
	{ id: 'b', title: 'Борис' },
	{ id: 'c', title: 'Вера' },
]

const PARTS = ['label', 'body', 'panel', 'header', 'title', 'count', 'search', 'all', 'list', 'actions', 'move', 'error'] as const

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function stubLayout(): void {
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		const index = Number(this.dataset.listIndex ?? 0)
		const left = this.closest('.base-transfer__panel--target') ? 300 : 0
		return DOMRect.fromRect({ x: left, y: index * 40, width: 200, height: 40 })
	})
}

const ghosts = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.base-transfer__ghost')]

describe('BaseTransfer: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseTransfer, {
			props: { items: ITEMS, label: 'Участники', isSearchable: true, error: 'Ошибка', ui, customClass: { panel: 'own' } },
		})
		const root = container.querySelector('.base-transfer')!
		expect(root).toHaveClass('base-transfer', 'u-root')
		for (const part of PARTS) expect(root.querySelector(`.base-transfer__${part}`)).toHaveClass(`base-transfer__${part}`, `u-${part}`)
		expect(root.querySelector('.base-transfer__panel')).toHaveClass('own', 'base-transfer__panel--source')
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', () => {
		const { container } = render(BaseTransfer, {
			props: { items: ITEMS, ariaLabel: 'Участники', ui: { actions: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTransfer: { ui: { actions: 'app', root: 'app-root' } } } })] },
		})
		expect(container.querySelector('.base-transfer')).toHaveClass('app-root')
		expect(container.querySelector('.base-transfer__actions')).toHaveAttribute('class', 'base-transfer__actions app own')
		expect(container.querySelector('.base-transfer__body')).toHaveAttribute('class', 'base-transfer__body')
	})
})

describe('BaseTransfer: движение переноса', () => {
	let animate: ReturnType<typeof vi.fn>

	beforeEach(() => {
		stubReducedMotion(false)
		stubLayout()
		animate = vi.fn()
		HTMLElement.prototype.animate = animate as unknown as HTMLElement['animate']
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
		Reflect.deleteProperty(HTMLElement.prototype, 'animate')
		document.documentElement.removeAttribute('data-rise-motion')
		document.body.innerHTML = ''
	})

	it('ушедшая строка гаснет копией поверх старого списка и сдвигается к новому; копия удаляется', async () => {
		const { rerender } = render(BaseTransfer, { props: { items: ITEMS, modelValue: [], ariaLabel: 'Участники' } })
		await rerender({ items: ITEMS, modelValue: ['b'], ariaLabel: 'Участники' })
		await waitFor(() => expect(ghosts()).toHaveLength(1))

		const [ghost] = ghosts()
		expect(ghost.parentElement).toHaveClass('base-transfer__list')
		expect(ghost.closest('.base-transfer__panel--source')).not.toBeNull()
		expect(ghost).toHaveClass('base-list__item')
		expect(ghost).toHaveAttribute('aria-hidden', 'true')
		expect(ghost.inert).toBe(true)
		expect(ghost.dataset.listId).toBe('b')
		expect(ghost.style.top).toBe('40px')
		expect(ghost.style.height).toBe('40px')
		const call = animate.mock.calls[animate.mock.contexts.indexOf(ghost)]
		expect(call[0]).toEqual([{ opacity: 1 }, { opacity: 0, transform: 'translateX(8px)' }])
		expect(call[1]).toMatchObject({ duration: 140, fill: 'forwards' })
		expect(within(screen.getByRole('listbox', { name: 'Выбрано' })).getByRole('option', { name: /Борис/ })).toBeInTheDocument()
		await waitFor(() => expect(ghosts()).toHaveLength(0))
	})

	it('перенос обратно — копия в «Выбрано» сдвигается влево; без переноса копий нет', async () => {
		const { rerender } = render(BaseTransfer, { props: { items: ITEMS, modelValue: ['a', 'b'], ariaLabel: 'Участники' } })
		await rerender({ items: ITEMS, modelValue: ['b', 'a'], ariaLabel: 'Участники' })
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(ghosts()).toHaveLength(0)

		await rerender({ items: ITEMS, modelValue: ['b'], ariaLabel: 'Участники' })
		await waitFor(() => expect(ghosts()).toHaveLength(1))
		expect(ghosts()[0].closest('.base-transfer__panel--target')).not.toBeNull()
		const call = animate.mock.calls[animate.mock.contexts.indexOf(ghosts()[0])]
		expect(call[0][1]).toEqual({ opacity: 0, transform: 'translateX(calc(8px * -1))' })
	})

	it('без Web Animations API перенос проходит без ошибок, копия удаляется по таймеру', async () => {
		Reflect.deleteProperty(HTMLElement.prototype, 'animate')
		const { rerender } = render(BaseTransfer, { props: { items: ITEMS, modelValue: [], ariaLabel: 'Участники' } })
		await rerender({ items: ITEMS, modelValue: ['c'], ariaLabel: 'Участники' })
		await waitFor(() => expect(ghosts()).toHaveLength(1))
		await waitFor(() => expect(ghosts()).toHaveLength(0))
		expect(within(screen.getByRole('listbox', { name: 'Выбрано' })).getByRole('option', { name: /Вера/ })).toBeInTheDocument()
	})

	it.each([
		['системное «уменьшить движение»', () => stubReducedMotion(true)],
		['пресет none', () => document.documentElement.setAttribute('data-rise-motion', 'none')],
	])('%s — сразу конечное состояние: без копий ушедших строк', async (_, setup) => {
		setup()
		const { rerender } = render(BaseTransfer, { props: { items: ITEMS, modelValue: [], ariaLabel: 'Участники' } })
		await rerender({ items: ITEMS, modelValue: ['a'], ariaLabel: 'Участники' })
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(ghosts()).toHaveLength(0)
		expect(within(screen.getByRole('listbox', { name: 'Выбрано' })).getByRole('option', { name: /Анна/ })).toBeInTheDocument()
	})
})
