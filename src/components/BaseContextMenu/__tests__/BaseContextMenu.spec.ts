import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import BaseContextMenu from '../ui/BaseContextMenu.vue'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const ITEMS: DropdownMenuItem[][] = [[{ label: 'Открыть' }, { label: 'Копировать ссылку' }], [{ label: 'Удалить', isDanger: true }]]

function renderArea(props: Record<string, unknown> = {}) {
	const utils = render(BaseContextMenu, {
		props: { items: ITEMS, ...props },
		slots: { default: () => h('button', { type: 'button' }, 'Серия 3') },
	})
	return { ...utils, card: screen.getByRole('button', { name: 'Серия 3' }) }
}

describe('BaseContextMenu', () => {
	it('правый клик открывает меню у указателя с фокусом на меню и отменяет меню браузера', async () => {
		const { card, emitted } = renderArea()
		const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 120, clientY: 80 })
		card.dispatchEvent(event)
		await nextTick()
		await nextTick()

		expect(event.defaultPrevented).toBe(true)
		const menu = screen.getByRole('menu', { name: 'Контекстное меню' })
		expect(menu).toHaveFocus()
		expect(emitted('update:isOpen')).toEqual([[true]])
		const anchor = document.querySelector('.base-context-menu__anchor') as HTMLElement
		expect(anchor.style.left).toBe('120px')
		expect(anchor.style.top).toBe('80px')
	})

	it('внутри предка с transform (Storybook Docs) якорь ставится в координатах этого предка', async () => {
		const host = document.createElement('div')
		host.style.transform = 'translateZ(0)'
		host.getBoundingClientRect = () => new DOMRect(30, 200, 600, 400)
		document.body.append(host)
		render(BaseContextMenu, {
			props: { items: ITEMS },
			slots: { default: () => h('button', { type: 'button' }, 'Кадр') },
			container: host,
		})
		screen
			.getByRole('button', { name: 'Кадр' })
			.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 330, clientY: 450 }))
		await nextTick()

		const anchor = host.querySelector('.base-context-menu__anchor') as HTMLElement
		expect(anchor.style.left).toBe('300px')
		expect(anchor.style.top).toBe('250px')
		host.remove()
	})

	it('Shift+F10 и клавиша «Меню» открывают меню у элемента с фокусом, на первом пункте; другие клавиши — нет', async () => {
		const { card } = renderArea({ ariaLabel: 'Действия с серией' })
		card.focus()
		await fireEvent.keyDown(card, { key: 'F10' })
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()

		await fireEvent.keyDown(card, { key: 'F10', shiftKey: true })
		await nextTick()
		expect(screen.getByRole('menu', { name: 'Действия с серией' })).toBeInTheDocument()
		expect(document.activeElement).toHaveTextContent('Открыть')

		document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
		await nextTick()
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()

		card.focus()
		await fireEvent.keyDown(card, { key: 'ContextMenu' })
		await nextTick()
		expect(screen.getByRole('menu')).toBeInTheDocument()
	})

	it('выбор пункта эмитит select, закрывает меню и возвращает фокус; флажок меню не закрывает', async () => {
		const onUpdateChecked = vi.fn()
		const { card, emitted } = render(BaseContextMenu, {
			props: { items: [{ label: 'Открыть' }, { type: 'checkbox', label: 'Закрепить', onUpdateChecked }] },
			slots: { default: () => h('button', { type: 'button' }, 'Серия 3') },
		}) && { card: screen.getByRole('button', { name: 'Серия 3' }), emitted: undefined }
		void emitted
		card.focus()
		await fireEvent.keyDown(card, { key: 'ContextMenu' })
		await nextTick()
		const menu = screen.getByRole('menu')

		await fireEvent.click(within(menu).getByRole('menuitemcheckbox', { name: 'Закрепить' }))
		expect(onUpdateChecked).toHaveBeenCalledWith(true)
		expect(screen.getByRole('menu')).toBeInTheDocument()

		await fireEvent.click(within(menu).getByRole('menuitem', { name: 'Открыть' }))
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
		expect(card).toHaveFocus()
	})

	it('select и update:isOpen приходят наружу; close() и openAt() — из кода', async () => {
		const { emitted, card } = renderArea()
		card.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
		await nextTick()
		await fireEvent.click(screen.getByRole('menuitem', { name: 'Копировать ссылку' }))
		expect(emitted<[DropdownMenuItem, Event]>('select')[0][0].label).toBe('Копировать ссылку')
		expect(emitted('update:isOpen')).toEqual([[true], [false]])
	})

	it('open и close из кода', async () => {
		const wrapper = (await import('@vue/test-utils')).mount(BaseContextMenu, {
			props: { items: ITEMS },
			slots: { default: '<div>Область</div>' },
			attachTo: document.body,
		})
		const api = wrapper.vm as unknown as { openAt: (x: number, y: number) => void; close: () => void }
		api.openAt(10, 20)
		await nextTick()
		expect(screen.getByRole('menu')).toBeInTheDocument()
		api.close()
		await nextTick()
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
		api.close()
		wrapper.unmount()
	})

	it('isDisabled: правый клик открывает меню браузера, клавиши не открывают своё', async () => {
		const { card } = renderArea({ isDisabled: true })
		const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
		card.dispatchEvent(event)
		expect(event.defaultPrevented).toBe(false)
		await fireEvent.keyDown(card, { key: 'ContextMenu' })
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})
})
