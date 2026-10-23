import '@testing-library/jest-dom/vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import type { DropdownMenuItem, DropdownMenuItems } from '../types/BaseDropdownMenu.types'

function renderMenu(items: DropdownMenuItems, props: Record<string, unknown> = {}) {
	const utils = render(BaseDropdownMenu, {
		props: { items, ...props },
		slots: { default: () => h('button', { type: 'button' }, 'Действия') },
	})
	return { ...utils, trigger: screen.getByRole('button', { name: 'Действия' }) }
}

async function openWithKeyboard(trigger: HTMLElement, key = 'Enter'): Promise<HTMLElement> {
	trigger.focus()
	await fireEvent.keyDown(trigger, { key })
	await nextTick()
	return screen.getByRole('menu')
}

function focused(): string | null | undefined {
	return document.activeElement?.textContent?.trim()
}

const ACTIONS: DropdownMenuItem[][] = [
	[{ label: 'Переименовать', shortcut: 'F2' }, { label: 'Дублировать', icon: 'copy' }, { label: 'Закрепить' }],
	[{ label: 'Удалить', isDanger: true }],
]

describe('BaseDropdownMenu', () => {
	it('кнопка получает ARIA кнопки меню, меню называется её текстом', async () => {
		const { trigger } = renderMenu(ACTIONS)
		expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
		expect(trigger).toHaveAttribute('aria-expanded', 'false')
		expect(trigger).not.toHaveAttribute('aria-controls')

		const menu = await openWithKeyboard(trigger)
		expect(trigger).toHaveAttribute('aria-expanded', 'true')
		expect(trigger).toHaveAttribute('aria-controls', menu.id)
		expect(menu).toHaveAccessibleName('Действия')
		expect(screen.getAllByRole('separator')).toHaveLength(1)
		expect(within(menu).getByText('F2')).toHaveAttribute('aria-hidden', 'true')

		const contextMenu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
		menu.dispatchEvent(contextMenu)
		expect(contextMenu.defaultPrevented).toBe(true)
	})

	it('ariaLabel называет меню вместо кнопки', async () => {
		const { trigger } = renderMenu(ACTIONS, { ariaLabel: 'Действия с серией' })
		const menu = await openWithKeyboard(trigger)
		expect(menu).toHaveAccessibleName('Действия с серией')
		expect(menu).not.toHaveAttribute('aria-labelledby')
	})

	it('Enter, Space и стрелка вниз открывают меню на первом пункте, стрелка вверх — на последнем', async () => {
		for (const key of ['Enter', ' ', 'ArrowDown']) {
			const { trigger, unmount } = renderMenu(ACTIONS)
			await openWithKeyboard(trigger, key)
			expect(focused()).toContain('Переименовать')
			unmount()
		}
		const { trigger } = renderMenu(ACTIONS)
		await openWithKeyboard(trigger, 'ArrowUp')
		expect(focused()).toBe('Удалить')
	})

	it('стрелки на кнопке открытого меню переводят фокус в меню; другие клавиши кнопку не трогают', async () => {
		const { trigger, emitted } = renderMenu(ACTIONS)
		await fireEvent.keyDown(trigger, { key: 'a' })
		expect(emitted('update:isOpen')).toBeUndefined()

		await openWithKeyboard(trigger)
		trigger.focus()
		await fireEvent.keyDown(trigger, { key: 'ArrowUp' })
		expect(focused()).toBe('Удалить')
		trigger.focus()
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
		expect(focused()).toContain('Переименовать')
	})

	it('клик открывает меню с фокусом на самом меню, повторный клик закрывает', async () => {
		const { trigger, emitted } = renderMenu(ACTIONS)
		await fireEvent.click(trigger)
		await nextTick()
		expect(screen.getByRole('menu')).toHaveFocus()

		await fireEvent.click(trigger)
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
		expect(emitted('update:isOpen')).toEqual([[true], [false]])
		expect(emitted('close')).toHaveLength(1)
	})

	it('roving tabindex: tabindex="0" только у текущего пункта', async () => {
		const { trigger } = renderMenu(ACTIONS)
		const menu = await openWithKeyboard(trigger)
		const [first, second] = within(menu).getAllByRole('menuitem')
		expect(first).toHaveAttribute('tabindex', '0')
		expect(second).toHaveAttribute('tabindex', '-1')

		await fireEvent.keyDown(menu, { key: 'ArrowDown' })
		expect(first).toHaveAttribute('tabindex', '-1')
		expect(second).toHaveAttribute('tabindex', '0')
	})

	it('стрелки ходят по пунктам по кругу, Home/End и PageUp/PageDown — к краям', async () => {
		const { trigger } = renderMenu(ACTIONS)
		const menu = await openWithKeyboard(trigger)
		await fireEvent.keyDown(menu, { key: 'ArrowUp' })
		expect(focused()).toBe('Удалить')
		await fireEvent.keyDown(menu, { key: 'ArrowDown' })
		expect(focused()).toContain('Переименовать')
		await fireEvent.keyDown(menu, { key: 'End' })
		expect(focused()).toBe('Удалить')
		await fireEvent.keyDown(menu, { key: 'Home' })
		expect(focused()).toContain('Переименовать')
		await fireEvent.keyDown(menu, { key: 'PageDown' })
		expect(focused()).toBe('Удалить')
		await fireEvent.keyDown(menu, { key: 'PageUp' })
		expect(focused()).toContain('Переименовать')
	})

	it('из самого меню стрелка вниз — к первому пункту, вверх — к последнему', async () => {
		const { trigger } = renderMenu(ACTIONS)
		await fireEvent.click(trigger)
		await nextTick()
		const menu = screen.getByRole('menu')
		await fireEvent.keyDown(menu, { key: 'ArrowDown' })
		expect(focused()).toContain('Переименовать')

		menu.focus()
		await fireEvent.keyDown(menu, { key: 'ArrowUp' })
		expect(focused()).toBe('Удалить')
	})

	it('выбор пункта вызывает onSelect, эмитит select, закрывает меню и возвращает фокус на кнопку', async () => {
		const onSelect = vi.fn()
		const { trigger, emitted } = renderMenu([{ label: 'Скопировать ссылку', onSelect }, { label: 'Скачать' }])
		const menu = await openWithKeyboard(trigger)
		await fireEvent.keyDown(menu, { key: 'Enter' })

		expect(onSelect).toHaveBeenCalledOnce()
		expect(emitted<[DropdownMenuItem, Event]>('select')[0][0].label).toBe('Скопировать ссылку')
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
		expect(trigger).toHaveFocus()
	})

	it('Space выбирает пункт, Enter и Space в пустом меню ничего не делают, Tab не уводит фокус', async () => {
		const { trigger, emitted } = renderMenu(ACTIONS)
		await fireEvent.click(trigger)
		await nextTick()
		const menu = screen.getByRole('menu')
		await fireEvent.keyDown(menu, { key: 'Enter' })
		await fireEvent.keyDown(menu, { key: ' ' })
		expect(emitted('select')).toBeUndefined()

		const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
		menu.dispatchEvent(tab)
		expect(tab.defaultPrevented).toBe(true)
		await fireEvent.keyDown(menu, { key: 'ArrowDown' })
		await fireEvent.keyDown(menu, { key: ' ' })
		expect(emitted('select')).toHaveLength(1)
	})

	it('недоступный пункт пропускается стрелками и не выбирается кликом', async () => {
		const { trigger, emitted } = renderMenu([{ label: 'Опубликовать', isDisabled: true }, { label: 'Сохранить' }])
		const menu = await openWithKeyboard(trigger)
		expect(focused()).toBe('Сохранить')
		const disabled = within(menu).getByRole('menuitem', { name: 'Опубликовать' })
		expect(disabled).toHaveAttribute('aria-disabled', 'true')

		await fireEvent.click(disabled)
		expect(emitted('select')).toBeUndefined()
	})

	it('флажок и переключатель: клик и Space меняют отметку без закрытия, Enter — с закрытием', async () => {
		const onUpdateChecked = vi.fn()
		const onRadio = vi.fn()
		const { trigger } = renderMenu([
			[
				{ type: 'label', label: 'Колонки' },
				{ type: 'checkbox', label: 'Автор', isChecked: false, onUpdateChecked },
			],
			[
				{ type: 'radio', label: 'По дате', isChecked: true, onUpdateChecked: onRadio },
				{ type: 'radio', label: 'По названию', isChecked: false, onUpdateChecked: onRadio },
			],
		])
		const menu = await openWithKeyboard(trigger)
		expect(within(menu).getByRole('group', { name: 'Колонки' })).toBeInTheDocument()
		const checkbox = within(menu).getByRole('menuitemcheckbox', { name: 'Автор' })
		expect(checkbox).toHaveAttribute('aria-checked', 'false')

		await fireEvent.click(checkbox)
		expect(onUpdateChecked).toHaveBeenLastCalledWith(true)
		expect(screen.getByRole('menu')).toBeInTheDocument()

		await fireEvent.keyDown(menu, { key: ' ' })
		expect(onUpdateChecked).toHaveBeenCalledTimes(2)
		expect(screen.getByRole('menu')).toBeInTheDocument()

		await fireEvent.click(within(menu).getByRole('menuitemradio', { name: 'По дате' }))
		expect(onRadio).not.toHaveBeenCalled()
		await fireEvent.click(within(menu).getByRole('menuitemradio', { name: 'По названию' }))
		expect(onRadio).toHaveBeenCalledWith(true)
		expect(within(menu).getByRole('menuitemradio', { name: 'По дате' })).toHaveAttribute('aria-checked', 'true')

		checkbox.focus()
		await fireEvent.keyDown(menu, { key: 'Enter' })
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})

	it('closeOnCheck: выбор переключателя мышью закрывает меню и возвращает фокус на кнопку', async () => {
		const onRadio = vi.fn()
		const { trigger } = renderMenu(
			[
				{ type: 'radio', label: '1×', isChecked: true, onUpdateChecked: onRadio },
				{ type: 'radio', label: '2×', isChecked: false, onUpdateChecked: onRadio },
			],
			{ closeOnCheck: true },
		)
		const menu = await openWithKeyboard(trigger)

		await fireEvent.click(within(menu).getByRole('menuitemradio', { name: '2×' }))
		expect(onRadio).toHaveBeenCalledWith(true)
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
		expect(trigger).toHaveFocus()
	})

	it('отмеченный флажок показывает галочку, переключатель — точку', async () => {
		const { trigger } = renderMenu([
			{ type: 'checkbox', label: 'Автор', isChecked: true },
			{ type: 'radio', label: 'По дате', isChecked: true },
		])
		await openWithKeyboard(trigger)
		expect(document.querySelectorAll('.base-dropdown-menu__indicator svg, .base-dropdown-menu__indicator .base-icon')).not.toHaveLength(
			0,
		)
		expect(document.querySelector('.base-dropdown-menu__dot')).toBeInTheDocument()
	})

	it('поиск по буквам: буква, повтор буквы, несколько букв, пробел внутри слова; без совпадений фокус на месте', async () => {
		vi.useFakeTimers()
		const { trigger } = renderMenu([
			{ label: 'Вставить' },
			{ label: 'Выделить всё' },
			{ label: 'Копировать' },
			{ label: 'Вставить как текст' },
		])
		const menu = await openWithKeyboard(trigger)

		await fireEvent.keyDown(menu, { key: 'к' })
		expect(focused()).toBe('Копировать')
		vi.advanceTimersByTime(600)

		await fireEvent.keyDown(menu, { key: 'в' })
		expect(focused()).toBe('Вставить как текст')
		await fireEvent.keyDown(menu, { key: 'в' })
		expect(focused()).toBe('Вставить')
		vi.advanceTimersByTime(600)

		await fireEvent.keyDown(menu, { key: 'в' })
		await fireEvent.keyDown(menu, { key: 'ы' })
		expect(focused()).toBe('Выделить всё')
		vi.advanceTimersByTime(600)

		await fireEvent.keyDown(menu, { key: 'в' })
		await fireEvent.keyDown(menu, { key: 'с' })
		await fireEvent.keyDown(menu, { key: 'т' })
		await fireEvent.keyDown(menu, { key: 'а' })
		await fireEvent.keyDown(menu, { key: 'в' })
		await fireEvent.keyDown(menu, { key: 'и' })
		await fireEvent.keyDown(menu, { key: 'т' })
		await fireEvent.keyDown(menu, { key: 'ь' })
		await fireEvent.keyDown(menu, { key: ' ' })
		await fireEvent.keyDown(menu, { key: 'к' })
		expect(focused()).toBe('Вставить как текст')
		vi.advanceTimersByTime(600)

		await fireEvent.keyDown(menu, { key: 'я' })
		expect(focused()).toBe('Вставить как текст')
		await fireEvent.keyDown(menu, { key: 'a', ctrlKey: true })
		await fireEvent.keyDown(menu, { key: 'F5' })
		expect(focused()).toBe('Вставить как текст')
		vi.useRealTimers()
	})

	it('нажатие, уже обработанное внутри пункта, меню не трогает', async () => {
		const { trigger } = renderMenu(ACTIONS)
		const menu = await openWithKeyboard(trigger)
		const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
		event.preventDefault()
		menu.dispatchEvent(event)
		expect(focused()).toContain('Переименовать')
	})

	it('пункт-ссылка — BaseLink с ролью menuitem; выбор закрывает меню', async () => {
		const { trigger, emitted } = renderMenu([
			{ label: 'Открыть на сайте', href: 'https://example.com/episodes/3' },
			{ label: 'Скачать' },
		])
		const menu = await openWithKeyboard(trigger)
		const link = within(menu).getByRole('menuitem', { name: 'Открыть на сайте' })
		expect(link.tagName).toBe('A')
		expect(link).toHaveAttribute('href', 'https://example.com/episodes/3')

		link.addEventListener('click', event => event.preventDefault())
		await fireEvent.click(link)
		expect(emitted('select')).toHaveLength(1)
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})

	it('наведение мышью ставит фокус на пункт; касание и недоступный пункт фокус не двигают', async () => {
		const { trigger } = renderMenu([{ label: 'Переименовать' }, { label: 'Опубликовать', isDisabled: true }, { label: 'Удалить' }])
		const menu = await openWithKeyboard(trigger)
		await fireEvent.pointerMove(within(menu).getByRole('menuitem', { name: 'Удалить' }), { pointerType: 'mouse' })
		expect(focused()).toBe('Удалить')
		await fireEvent.pointerMove(within(menu).getByRole('menuitem', { name: 'Удалить' }), { pointerType: 'mouse' })
		expect(focused()).toBe('Удалить')

		await fireEvent.pointerMove(within(menu).getByRole('menuitem', { name: 'Переименовать' }), { pointerType: 'touch' })
		expect(focused()).toBe('Удалить')
		await fireEvent.pointerMove(within(menu).getByRole('menuitem', { name: 'Опубликовать' }), { pointerType: 'mouse' })
		expect(focused()).toBe('Удалить')
	})

	it('isOpen управляет меню снаружи; open() и close() — из кода', async () => {
		const isOpen = ref(true)
		const menuRef = ref<InstanceType<typeof BaseDropdownMenu> | null>(null)
		render(
			defineComponent({
				setup: () => () =>
					h(
						BaseDropdownMenu,
						{
							ref: menuRef,
							items: ACTIONS,
							isOpen: isOpen.value,
							'onUpdate:isOpen': (value: boolean) => (isOpen.value = value),
						},
						{ default: () => h('button', { type: 'button' }, 'Действия') },
					),
			}),
		)
		expect(screen.getByRole('menu')).toBeInTheDocument()
		isOpen.value = false
		await nextTick()
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()

		menuRef.value?.open()
		await nextTick()
		await nextTick()
		expect(isOpen.value).toBe(true)
		expect(focused()).toContain('Переименовать')
		menuRef.value?.open()
		menuRef.value?.close()
		await nextTick()
		expect(isOpen.value).toBe(false)
	})

	it('без пунктов меню пустое; стрелки и выбор ничего не делают', async () => {
		const { trigger, emitted } = renderMenu([])
		const menu = await openWithKeyboard(trigger)
		await fireEvent.keyDown(menu, { key: 'ArrowDown' })
		await fireEvent.keyDown(menu, { key: 'x' })
		expect(emitted('select')).toBeUndefined()
	})

	it('при закрытии до отрисовки фокус в меню не ставится', async () => {
		const { trigger } = renderMenu(ACTIONS)
		trigger.focus()
		await fireEvent.keyDown(trigger, { key: 'Enter' })
		await fireEvent.click(trigger)
		await nextTick()
		expect(trigger).toHaveFocus()
	})

	describe('подменю', () => {
		const ITEMS: DropdownMenuItem[] = [
			{ label: 'Переименовать' },
			{ label: 'Скачать', children: [{ label: 'Видео MP4' }, { label: 'Субтитры SRT' }] },
			{ label: 'Архив', isDisabled: true, children: [{ label: 'Сезон 1' }] },
			{ label: 'Удалить' },
		]

		function submenu(): HTMLElement | null {
			return screen.queryByRole('menu', { name: 'Скачать' })
		}

		it('стрелка вправо открывает подменю на первом пункте, влево — закрывает и возвращает фокус', async () => {
			const { trigger } = renderMenu(ITEMS)
			const menu = await openWithKeyboard(trigger)
			const download = within(menu).getByRole('menuitem', { name: 'Скачать' })
			expect(download).toHaveAttribute('aria-haspopup', 'menu')

			await fireEvent.keyDown(menu, { key: 'ArrowRight' })
			expect(submenu()).not.toBeInTheDocument()

			download.focus()
			await fireEvent.keyDown(menu, { key: 'ArrowRight' })
			await nextTick()
			expect(download).toHaveAttribute('aria-expanded', 'true')
			expect(focused()).toBe('Видео MP4')

			await fireEvent.keyDown(submenu() as HTMLElement, { key: 'ArrowLeft' })
			expect(submenu()).not.toBeInTheDocument()
			expect(download).toHaveFocus()

			await fireEvent.keyDown(menu, { key: 'ArrowLeft' })
			expect(screen.getByRole('menu')).toBeInTheDocument()
		})

		it('Enter на пункте открывает подменю, выбор в подменю закрывает всё меню', async () => {
			const { trigger, emitted } = renderMenu(ITEMS)
			const menu = await openWithKeyboard(trigger)
			within(menu).getByRole('menuitem', { name: 'Скачать' }).focus()
			await fireEvent.keyDown(menu, { key: 'Enter' })
			await nextTick()
			expect(focused()).toBe('Видео MP4')

			await fireEvent.keyDown(submenu() as HTMLElement, { key: 'ArrowDown' })
			await fireEvent.keyDown(submenu() as HTMLElement, { key: 'Enter' })
			expect(emitted<[DropdownMenuItem, Event]>('select')[0][0].label).toBe('Субтитры SRT')
			expect(screen.queryByRole('menu')).not.toBeInTheDocument()
			expect(trigger).toHaveFocus()
		})

		it('флажок в подменю не закрывает меню', async () => {
			const onUpdateChecked = vi.fn()
			const { trigger } = renderMenu([{ label: 'Вид', children: [{ type: 'checkbox', label: 'Автор', onUpdateChecked }] }])
			const menu = await openWithKeyboard(trigger)
			await fireEvent.keyDown(menu, { key: 'ArrowRight' })
			await nextTick()
			await fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Автор' }))
			expect(onUpdateChecked).toHaveBeenCalledWith(true)
			expect(screen.getByRole('menu', { name: 'Вид' })).toBeInTheDocument()
		})

		it('клик открывает и закрывает подменю; недоступный пункт с подменю не открывается', async () => {
			const { trigger } = renderMenu(ITEMS)
			const menu = await openWithKeyboard(trigger)
			const download = within(menu).getByRole('menuitem', { name: 'Скачать' })
			await fireEvent.click(download)
			expect(submenu()).toBeInTheDocument()
			await fireEvent.click(download)
			expect(submenu()).not.toBeInTheDocument()

			await fireEvent.click(within(menu).getByRole('menuitem', { name: 'Архив' }))
			expect(screen.queryByRole('menu', { name: 'Архив' })).not.toBeInTheDocument()
		})

		it('наведение открывает подменю с задержкой, уход на другой пункт закрывает; вход в подменю отменяет закрытие', async () => {
			vi.useFakeTimers()
			const { trigger } = renderMenu(ITEMS)
			const menu = await openWithKeyboard(trigger)
			const download = within(menu).getByRole('menuitem', { name: 'Скачать' })

			await fireEvent.pointerMove(download, { pointerType: 'mouse' })
			expect(submenu()).not.toBeInTheDocument()
			vi.advanceTimersByTime(150)
			await nextTick()
			expect(submenu()).toBeInTheDocument()
			await fireEvent.pointerMove(download, { pointerType: 'mouse' })

			await fireEvent.pointerMove(within(menu).getByRole('menuitem', { name: 'Удалить' }), { pointerType: 'mouse' })
			await fireEvent.pointerEnter(submenu() as HTMLElement)
			vi.advanceTimersByTime(150)
			await nextTick()
			expect(submenu()).toBeInTheDocument()

			await fireEvent.pointerMove(within(menu).getByRole('menuitem', { name: 'Удалить' }), { pointerType: 'mouse' })
			vi.advanceTimersByTime(150)
			await nextTick()
			expect(submenu()).not.toBeInTheDocument()
			vi.useRealTimers()
		})

		it('Escape закрывает только подменю, фокус возвращается на его пункт', async () => {
			const { trigger } = renderMenu(ITEMS)
			const menu = await openWithKeyboard(trigger)
			const download = within(menu).getByRole('menuitem', { name: 'Скачать' })
			download.focus()
			await fireEvent.keyDown(menu, { key: 'ArrowRight' })
			await nextTick()

			document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
			await nextTick()
			expect(submenu()).not.toBeInTheDocument()
			expect(screen.getByRole('menu')).toBeInTheDocument()
			await waitFor(() => expect(download).toHaveFocus())
		})

		it('размонтирование открытого меню снимает таймеры наведения и поиска', async () => {
			vi.useFakeTimers()
			const { trigger, unmount } = renderMenu(ITEMS)
			const menu = await openWithKeyboard(trigger)
			await fireEvent.pointerMove(within(menu).getByRole('menuitem', { name: 'Скачать' }), { pointerType: 'mouse' })
			await fireEvent.keyDown(menu, { key: 'у' })
			unmount()
			expect(() => vi.runAllTimers()).not.toThrow()
			vi.useRealTimers()
		})
	})

	describe('триггер без кнопки (small-fixes-7a)', () => {
		it('span в слоте — role="button" и tabindex, Enter открывает меню, выбор возвращает фокус на span', async () => {
			render(BaseDropdownMenu, {
				props: { items: ACTIONS },
				slots: { default: () => h('span', null, 'Ещё') },
			})
			const trigger = screen.getByRole('button', { name: 'Ещё' })
			expect(trigger.tagName).toBe('SPAN')
			expect(trigger).toHaveAttribute('tabindex', '0')
			expect(trigger).toHaveAttribute('aria-haspopup', 'menu')

			const menu = await openWithKeyboard(trigger)
			expect(trigger).toHaveAttribute('aria-expanded', 'true')
			await waitFor(() => expect(focused()).toContain('Переименовать'))
			await fireEvent.click(within(menu).getByRole('menuitem', { name: /Дублировать/ }))
			expect(trigger).toHaveFocus()
		})

		it('кнопка в слоте — без role и tabindex', () => {
			const { trigger } = renderMenu(ACTIONS)
			expect(trigger).not.toHaveAttribute('role')
			expect(trigger).not.toHaveAttribute('tabindex')
		})
	})
})
