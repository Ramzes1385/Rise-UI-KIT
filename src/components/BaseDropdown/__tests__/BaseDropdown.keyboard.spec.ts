import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
import BaseDropdown from '../ui/BaseDropdown.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

vi.mock('@composables/overlay/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/overlay/useDropdownPosition', () => ({
	useDropdownPosition: () => ({
		panelStyle: { value: {} },
		arrow: { value: { side: 'top' } },
		arrowStyle: { value: {} },
		updatePosition: vi.fn(),
	}),
}))

const MENU_PANEL = `
	<div role="menu" aria-label="Действия">
		<button type="button" role="menuitem" tabindex="-1">Копировать</button>
		<button type="button" role="menuitem" tabindex="-1" aria-disabled="true">Вырезать</button>
		<button type="button" role="menuitemcheckbox" aria-checked="false" tabindex="-1">Сетка</button>
		<button type="button" role="menuitemradio" aria-checked="true" tabindex="-1">Масштаб</button>
	</div>
	<input aria-label="Фильтр" />
`

const FORM_PANEL = `
	<button type="button">Первая</button>
	<button type="button">Вторая</button>
`

function renderHost(panel: string, props: Record<string, unknown> = {}) {
	const onClose = vi.fn()
	const Host = defineComponent({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(false)
			return { isOpen, props, onClose }
		},
		template: `
			<button type="button">До</button>
			<BaseDropdown v-model:is-open="isOpen" v-bind="props" @close="onClose">
				<button type="button" @click="isOpen = !isOpen">Открыть</button>
				<template #dropdown>${panel}</template>
			</BaseDropdown>
			<button type="button">После</button>
		`,
	})
	return { ...render(Host), onClose }
}

async function openWithTrigger(user: ReturnType<typeof userEvent.setup>): Promise<HTMLElement> {
	const trigger = screen.getByRole('button', { name: 'Открыть' })
	await user.click(trigger)
	return trigger
}

describe('BaseDropdown: клавиатура панели (APG Menu Button, Disclosure, Dialog)', () => {
	describe('Tab из панели-списка', () => {
		it('Tab с последнего элемента закрывает панель и возвращает фокус на триггер', async () => {
			const user = userEvent.setup()
			const { onClose } = renderHost(FORM_PANEL, { preventMousedown: false })
			const trigger = await openWithTrigger(user)
			screen.getByRole('button', { name: 'Вторая' }).focus()

			await user.tab()

			expect(onClose).toHaveBeenCalledOnce()
			expect(screen.queryByRole('button', { name: 'Вторая' })).not.toBeInTheDocument()
			expect(trigger).toHaveFocus()
		})

		it('Shift+Tab с первого элемента закрывает панель и возвращает фокус на триггер', async () => {
			const user = userEvent.setup()
			const { onClose } = renderHost(FORM_PANEL, { preventMousedown: false })
			const trigger = await openWithTrigger(user)
			screen.getByRole('button', { name: 'Первая' }).focus()

			await user.tab({ shift: true })

			expect(onClose).toHaveBeenCalledOnce()
			expect(trigger).toHaveFocus()
		})

		it('Tab внутри панели переводит фокус и не закрывает её', async () => {
			const user = userEvent.setup()
			const { onClose } = renderHost(FORM_PANEL, { preventMousedown: false })
			await openWithTrigger(user)
			screen.getByRole('button', { name: 'Первая' }).focus()

			await user.tab()

			expect(screen.getByRole('button', { name: 'Вторая' })).toHaveFocus()
			expect(onClose).not.toHaveBeenCalled()
		})

		it('Tab, отменённый своим обработчиком содержимого (preventDefault), панель не закрывает', async () => {
			const { onClose } = renderHost(FORM_PANEL, { preventMousedown: false })
			await openWithTrigger(userEvent.setup())
			const last = screen.getByRole('button', { name: 'Вторая' })
			last.addEventListener('keydown', event => event.preventDefault())

			last.focus()

			await fireEvent.keyDown(last, { key: 'Tab' })

			expect(onClose).not.toHaveBeenCalled()
		})

		it('панель, открытая без фокуса на триггере, возвращает фокус на первую кнопку обёртки', async () => {
			const user = userEvent.setup()
			const onClose = vi.fn()
			render(BaseDropdown, {
				props: { isOpen: true, preventMousedown: false, onClose },
				slots: { default: '<button type="button">Триггер</button>', dropdown: FORM_PANEL },
			})
			screen.getByRole('button', { name: 'Вторая' }).focus()

			await user.tab()

			expect(onClose).toHaveBeenCalledOnce()
			expect(screen.getByRole('button', { name: 'Триггер' })).toHaveFocus()
		})

		it('без фокусируемого элемента в обёртке панель закрывается, фокус остаётся', async () => {
			const onClose = vi.fn()
			render(BaseDropdown, {
				props: { isOpen: true, preventMousedown: false, onClose },
				slots: { default: '<span>Подпись</span>', dropdown: FORM_PANEL },
			})
			const last = screen.getByRole('button', { name: 'Вторая' })
			last.focus()

			await fireEvent.keyDown(last, { key: 'Tab' })

			expect(onClose).toHaveBeenCalledOnce()
			expect(last).toHaveFocus()
		})

		it('Tab с пункта меню (tabindex="-1") после последнего элемента закрывает панель', async () => {
			const user = userEvent.setup()
			const { onClose } = renderHost(MENU_PANEL.replace('<input aria-label="Фильтр" />', ''), { preventMousedown: false })
			const trigger = await openWithTrigger(user)
			screen.getByRole('menuitem', { name: 'Копировать' }).focus()

			await user.tab()

			expect(onClose).toHaveBeenCalledOnce()
			expect(trigger).toHaveFocus()
		})

		it('Tab с пункта меню переходит к полю панели после него и не закрывает её', async () => {
			const user = userEvent.setup()
			const { onClose } = renderHost(MENU_PANEL, { preventMousedown: false })
			await openWithTrigger(user)
			screen.getByRole('menuitem', { name: 'Копировать' }).focus()

			await user.tab()

			expect(screen.getByRole('textbox', { name: 'Фильтр' })).toHaveFocus()
			expect(onClose).not.toHaveBeenCalled()
		})
	})

	describe('preventMousedown по умолчанию и Tab', () => {
		it('Tab из поля панели переводит фокус на кнопку панели, а не возвращает его на триггер', async () => {
			const user = userEvent.setup()
			renderHost('<input aria-label="Метка" /><button type="button">Добавить</button>')
			await openWithTrigger(user)
			await user.click(screen.getByRole('textbox', { name: 'Метка' }))

			await user.tab()

			expect(screen.getByRole('button', { name: 'Добавить' })).toHaveFocus()
		})

		it('Tab с последней кнопки после поля закрывает панель и возвращает фокус на триггер', async () => {
			const user = userEvent.setup()
			const { onClose } = renderHost('<input aria-label="Метка" /><button type="button">Добавить</button>')
			const trigger = await openWithTrigger(user)
			await user.click(screen.getByRole('textbox', { name: 'Метка' }))
			await user.tab()

			await user.tab()

			expect(onClose).toHaveBeenCalledOnce()
			expect(trigger).toHaveFocus()
		})
	})

	describe('стрелки по пунктам', () => {
		it('ArrowDown и ArrowUp ходят по пунктам по кругу и пропускают недоступный', async () => {
			const user = userEvent.setup()
			renderHost(MENU_PANEL, { preventMousedown: false })
			await openWithTrigger(user)
			const copy = screen.getByRole('menuitem', { name: 'Копировать' })
			copy.focus()

			await user.keyboard('{ArrowDown}')
			expect(screen.getByRole('menuitemcheckbox', { name: 'Сетка' })).toHaveFocus()
			await user.keyboard('{ArrowDown}')
			expect(screen.getByRole('menuitemradio', { name: 'Масштаб' })).toHaveFocus()
			await user.keyboard('{ArrowDown}')
			expect(copy).toHaveFocus()
			await user.keyboard('{ArrowUp}')
			expect(screen.getByRole('menuitemradio', { name: 'Масштаб' })).toHaveFocus()
		})

		it('Home и End переводят фокус на первый и последний пункт', async () => {
			const user = userEvent.setup()
			renderHost(MENU_PANEL, { preventMousedown: false })
			await openWithTrigger(user)
			screen.getByRole('menuitemcheckbox', { name: 'Сетка' }).focus()

			await user.keyboard('{End}')
			expect(screen.getByRole('menuitemradio', { name: 'Масштаб' })).toHaveFocus()
			await user.keyboard('{Home}')
			expect(screen.getByRole('menuitem', { name: 'Копировать' })).toHaveFocus()
		})

		it('стрелки в поле панели не уводят фокус на пункты', async () => {
			const user = userEvent.setup()
			renderHost(MENU_PANEL, { preventMousedown: false })
			await openWithTrigger(user)
			const input = screen.getByRole('textbox', { name: 'Фильтр' })
			input.focus()

			await user.keyboard('{ArrowDown}')

			expect(input).toHaveFocus()
		})

		it('другие клавиши на пункте не перехватываются', async () => {
			renderHost(MENU_PANEL, { preventMousedown: false })
			await openWithTrigger(userEvent.setup())
			const copy = screen.getByRole('menuitem', { name: 'Копировать' })
			copy.focus()

			const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
			copy.dispatchEvent(event)

			expect(event.defaultPrevented).toBe(false)
			expect(copy).toHaveFocus()
		})

		it('нажатие, уже обработанное пунктом (preventDefault), панель не двигает', async () => {
			renderHost(MENU_PANEL, { preventMousedown: false })
			await openWithTrigger(userEvent.setup())
			const copy = screen.getByRole('menuitem', { name: 'Копировать' })
			copy.addEventListener('keydown', event => event.preventDefault())
			copy.focus()

			await fireEvent.keyDown(copy, { key: 'ArrowDown' })

			expect(copy).toHaveFocus()
		})
	})

	describe('trapFocus — панель-диалог', () => {
		it('при открытии фокус переходит в панель, Tab ходит по кругу, панель не закрывается', async () => {
			const user = userEvent.setup()
			const { onClose } = renderHost(FORM_PANEL, { trapFocus: true })
			await openWithTrigger(user)
			const first = screen.getByRole('button', { name: 'Первая' })

			expect(first).toHaveFocus()
			await user.tab()
			expect(screen.getByRole('button', { name: 'Вторая' })).toHaveFocus()
			await user.tab()
			expect(first).toHaveFocus()
			await user.tab({ shift: true })
			expect(screen.getByRole('button', { name: 'Вторая' })).toHaveFocus()
			expect(onClose).not.toHaveBeenCalled()
		})

		it('Escape закрывает панель и возвращает фокус на триггер', async () => {
			const user = userEvent.setup()
			const { onClose } = renderHost(FORM_PANEL, { trapFocus: true })
			const trigger = await openWithTrigger(user)

			await user.keyboard('{Escape}')

			expect(onClose).toHaveBeenCalledOnce()
			expect(trigger).toHaveFocus()
		})

		it('preventMousedown не возвращает фокус на триггер: клик по кнопке панели оставляет фокус в панели', async () => {
			const user = userEvent.setup()
			renderHost(FORM_PANEL, { trapFocus: true })
			await openWithTrigger(user)
			const second = screen.getByRole('button', { name: 'Вторая' })

			const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
			second.dispatchEvent(event)
			second.focus()

			expect(event.defaultPrevented).toBe(false)
			expect(second).toHaveFocus()
		})
	})
})
