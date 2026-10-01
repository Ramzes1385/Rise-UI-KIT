import '@testing-library/jest-dom/vitest'
import type { Component } from 'vue'
import { useFocusTrap } from '../useFocusTrap'
import userEvent from '@testing-library/user-event'
import { defineComponent, onMounted, ref } from 'vue'
import { render, screen, waitFor } from '@testing-library/vue'

/** Хост: триггер и соседняя кнопка снаружи, диалог с заданным содержимым */
function createHost(dialogContent: string, options: { hideTriggerWhenOpen?: boolean } = {}) {
	return defineComponent({
		setup() {
			const isOpen = ref(false)
			const dialogRef = ref<HTMLElement | null>(null)
			useFocusTrap({ containerRef: dialogRef, isActive: () => isOpen.value })
			return { isOpen, dialogRef, hideTriggerWhenOpen: options.hideTriggerWhenOpen ?? false }
		},
		template: `
			<div>
				<button v-if="!(hideTriggerWhenOpen && isOpen)" type="button" @click="isOpen = true">Открыть</button>
				<button type="button">Снаружи</button>
				<div v-if="isOpen" ref="dialogRef" role="dialog" aria-label="Диалог">
					${dialogContent}
					<button type="button" data-close @click="isOpen = false">Готово</button>
				</div>
			</div>
		`,
	})
}

/**
 * Страница с кнопкой «Снаружи», на которой через v-if появляется диалог с ловушкой, активной с момента монтирования
 * (окно, отрисованное сразу открытым). Диалог показывается повторным рендером (проп isShown), как в приложении:
 * начальный render() из @testing-library/vue после монтирования переносит DOM-узлы из обёртки
 * и тем самым сбрасывает фокус, выставленный при монтировании
 */
async function showActiveTrapDialog(options: { dialogAttrs?: string; content: string; components?: Record<string, Component> }) {
	const TrapDialog = defineComponent({
		components: options.components ?? {},
		setup() {
			const dialogRef = ref<HTMLElement | null>(null)
			useFocusTrap({ containerRef: dialogRef, isActive: () => true })
			return { dialogRef }
		},
		template: `<div ref="dialogRef" role="dialog" aria-label="Диалог" ${options.dialogAttrs ?? ''}>${options.content}</div>`,
	})
	const Page = defineComponent({
		components: { TrapDialog },
		props: { isShown: { type: Boolean, default: false } },
		template: '<div><button type="button">Снаружи</button><TrapDialog v-if="isShown" /></div>',
	})

	const view = render(Page)
	await view.rerender({ isShown: true })
	return { ...view, dialog: screen.getByRole('dialog', { name: 'Диалог' }) }
}

describe('useFocusTrap', () => {
	it('при активации переводит фокус на первый фокусируемый элемент', async () => {
		const user = userEvent.setup()
		render(createHost('<input aria-label="Имя" />'))

		await user.click(screen.getByRole('button', { name: 'Открыть' }))

		await waitFor(() => expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveFocus())
	})

	it('предпочитает элемент с autofocus', async () => {
		const user = userEvent.setup()
		render(createHost('<button type="button">Первая</button><input aria-label="Поиск" autofocus />'))

		await user.click(screen.getByRole('button', { name: 'Открыть' }))

		await waitFor(() => expect(screen.getByRole('textbox', { name: 'Поиск' })).toHaveFocus())
	})

	it('пропускает disabled, tabindex=-1 и скрытые элементы', async () => {
		const user = userEvent.setup()
		render(
			createHost(
				'<button type="button" disabled>Выключена</button><span tabindex="-1">Служебный</span><div hidden><button type="button">Скрытая</button></div><a href="#x">Ссылка</a>',
			),
		)

		await user.click(screen.getByRole('button', { name: 'Открыть' }))

		await waitFor(() => expect(screen.getByRole('link', { name: 'Ссылка' })).toHaveFocus())
	})

	it('в окне, открытом сразу при монтировании, переводит фокус внутрь', async () => {
		await showActiveTrapDialog({ content: '<p>Описание</p><input aria-label="Имя" />' })

		expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveFocus()
	})

	it('без фокусируемых элементов фокусирует сам контейнер с tabindex=-1', async () => {
		const { dialog } = await showActiveTrapDialog({ content: '<p>Только текст</p>' })

		expect(dialog).toHaveFocus()
		expect(dialog).toHaveAttribute('tabindex', '-1')
	})

	it('не перезаписывает tabindex, заданный контейнеру', async () => {
		const { dialog } = await showActiveTrapDialog({ dialogAttrs: 'tabindex="0"', content: '<p>Только текст</p>' })

		expect(dialog).toHaveFocus()
		expect(dialog).toHaveAttribute('tabindex', '0')
	})

	it('не перебивает фокус, который дочерний компонент выставил при монтировании', async () => {
		const AutoFocusInput = defineComponent({
			setup() {
				const inputRef = ref<HTMLInputElement | null>(null)
				onMounted(() => inputRef.value?.focus())
				return { inputRef }
			},
			template: '<input ref="inputRef" aria-label="Поиск" />',
		})

		await showActiveTrapDialog({
			content: '<button type="button">Первая</button><AutoFocusInput />',
			components: { AutoFocusInput },
		})

		expect(screen.getByRole('textbox', { name: 'Поиск' })).toHaveFocus()
	})

	it('Tab с последнего элемента переходит на первый, Shift+Tab с первого — на последний', async () => {
		const user = userEvent.setup()
		render(createHost('<input aria-label="Имя" /><button type="button">Отмена</button>'))

		await user.click(screen.getByRole('button', { name: 'Открыть' }))
		const nameInput = screen.getByRole('textbox', { name: 'Имя' })
		await waitFor(() => expect(nameInput).toHaveFocus())

		await user.tab()
		expect(screen.getByRole('button', { name: 'Отмена' })).toHaveFocus()
		await user.tab()
		expect(screen.getByRole('button', { name: 'Готово' })).toHaveFocus()
		await user.tab()
		expect(nameInput).toHaveFocus()

		await user.tab({ shift: true })
		expect(screen.getByRole('button', { name: 'Готово' })).toHaveFocus()
	})

	it('Shift+Tab и Tab между элементами внутри контейнера не перехватываются', async () => {
		const user = userEvent.setup()
		render(createHost('<input aria-label="Имя" /><button type="button">Отмена</button>'))

		await user.click(screen.getByRole('button', { name: 'Открыть' }))
		await waitFor(() => expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveFocus())
		await user.tab()
		const cancel = screen.getByRole('button', { name: 'Отмена' })
		expect(cancel).toHaveFocus()

		const shiftTab = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
		cancel.dispatchEvent(shiftTab)
		const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
		cancel.dispatchEvent(tab)

		expect(shiftTab.defaultPrevented).toBe(false)
		expect(tab.defaultPrevented).toBe(false)
		expect(cancel).toHaveFocus()
	})

	it('Shift+Tab с самого контейнера (после клика по фону диалога) переходит на последний элемент', async () => {
		const user = userEvent.setup()
		const { dialog } = await showActiveTrapDialog({
			dialogAttrs: 'tabindex="-1"',
			content: '<button type="button">Первая</button><p>Текст диалога</p><button type="button">Последняя</button>',
		})

		await user.click(screen.getByText('Текст диалога'))
		expect(dialog).toHaveFocus()

		await user.tab({ shift: true })

		expect(screen.getByRole('button', { name: 'Последняя' })).toHaveFocus()
	})

	it('без фокусируемых элементов Tab и Shift+Tab удерживают фокус на контейнере', async () => {
		const user = userEvent.setup()
		const { dialog } = await showActiveTrapDialog({ content: '<p>Только текст</p>' })

		await user.tab()
		expect(dialog).toHaveFocus()
		await user.tab({ shift: true })
		expect(dialog).toHaveFocus()
	})

	it('при деактивации возвращает фокус на триггер', async () => {
		const user = userEvent.setup()
		render(createHost('<input aria-label="Имя" />'))
		const trigger = screen.getByRole('button', { name: 'Открыть' })

		await user.click(trigger)
		await waitFor(() => expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveFocus())
		await user.click(screen.getByRole('button', { name: 'Готово' }))

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		expect(trigger).toHaveFocus()
	})

	it('не возвращает фокус на триггер, удалённый из DOM, и не падает', async () => {
		const user = userEvent.setup()
		render(createHost('<input aria-label="Имя" />', { hideTriggerWhenOpen: true }))

		await user.click(screen.getByRole('button', { name: 'Открыть' }))
		await waitFor(() => expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveFocus())
		await user.click(screen.getByRole('button', { name: 'Готово' }))

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		expect(document.activeElement).not.toBeNull()
		expect(screen.getByRole('button', { name: 'Открыть' })).not.toHaveFocus()
	})

	it('при размонтировании активной ловушки возвращает фокус на внешний триггер', async () => {
		const externalTrigger = document.createElement('button')
		externalTrigger.textContent = 'Внешний триггер'
		document.body.appendChild(externalTrigger)
		externalTrigger.focus()

		const { rerender } = await showActiveTrapDialog({ content: '<input aria-label="Имя" />' })
		expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveFocus()

		await rerender({ isShown: false })

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		expect(externalTrigger).toHaveFocus()
		externalTrigger.remove()
	})

	it('без отрендеренного контейнера не уводит фокус, не перехватывает Tab и не бросает ошибок', async () => {
		const user = userEvent.setup()
		// Например, цель Teleport не найдена: ловушка активна, а ref контейнера пуст
		const Host = defineComponent({
			setup() {
				const isOpen = ref(false)
				const dialogRef = ref<HTMLElement | null>(null)
				useFocusTrap({ containerRef: dialogRef, isActive: () => isOpen.value })
				return { isOpen }
			},
			template: `
				<div>
					<button type="button" @click="isOpen = true">Открыть</button>
					<button type="button">Снаружи</button>
				</div>
			`,
		})
		render(Host)
		const trigger = screen.getByRole('button', { name: 'Открыть' })

		await user.click(trigger)
		expect(trigger).toHaveFocus()

		// Исключение в обработчике keydown не роняет тест само по себе — jsdom сообщает о нём событием error
		const listenerErrors: unknown[] = []
		const collectError = (event: ErrorEvent) => listenerErrors.push(event.error)
		window.addEventListener('error', collectError)
		await user.tab()
		window.removeEventListener('error', collectError)

		expect(listenerErrors).toEqual([])
		expect(screen.getByRole('button', { name: 'Снаружи' })).toHaveFocus()
	})

	it('не перехватывает Tab, когда фокус во вложенном слое за пределами контейнера', async () => {
		const user = userEvent.setup()
		render(createHost('<input aria-label="Имя" />'))
		await user.click(screen.getByRole('button', { name: 'Открыть' }))
		const dialog = screen.getByRole('dialog', { name: 'Диалог' })
		await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement))

		// Панель вложенного оверлея (селекта, поповера) телепортирована в конец body
		const nestedPanel = document.createElement('div')
		nestedPanel.innerHTML = '<button type="button">Первая опция</button><button type="button">Вторая опция</button>'
		document.body.appendChild(nestedPanel)
		screen.getByRole('button', { name: 'Первая опция' }).focus()

		await user.tab()

		expect(screen.getByRole('button', { name: 'Вторая опция' })).toHaveFocus()
		nestedPanel.remove()
	})
})
