import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { BaseApp } from '@components/BaseApp'
import { BaseModal } from '@components/BaseModal'
import { BaseEditor } from '@components/BaseEditor'
import { BaseDropdown } from '@components/BaseDropdown'
import { defineComponent, h, nextTick, ref } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import ChatEmojiPicker from '@components/BaseChat/ui/ChatInput/ChatEmojiPicker.vue'
import ChatMessageContextMenu from '@components/BaseChat/ui/ChatMessageList/ui/ChatMessageContextMenu.vue'

/** Окно со списком внутри: состояния открытия снаружи */
function renderModalWithList() {
	const isModalOpen = ref(true)
	const isListOpen = ref(false)
	const { unmount } = render(
		defineComponent({
			setup: () => () =>
				h(
					BaseModal,
					{ isOpen: isModalOpen.value, title: 'Настройки', 'onUpdate:isOpen': (value: boolean) => (isModalOpen.value = value) },
					() =>
						h(
							BaseDropdown,
							{ isOpen: isListOpen.value, 'onUpdate:isOpen': (value: boolean) => (isListOpen.value = value) },
							{
								default: () => h('button', { type: 'button' }, 'Язык'),
								dropdown: () => h('button', { type: 'button' }, 'English'),
							},
						),
				),
		}),
	)
	return { isModalOpen, isListOpen, unmount }
}

async function pressEscape(): Promise<void> {
	document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
	await nextTick()
}

describe('слои оверлеев', () => {
	it('Escape: сначала закрывается список, затем окно', async () => {
		const { isModalOpen, isListOpen } = renderModalWithList()
		isListOpen.value = true
		await nextTick()

		await pressEscape()
		expect(isListOpen.value).toBe(false)
		expect(isModalOpen.value).toBe(true)

		await pressEscape()
		expect(isModalOpen.value).toBe(false)
	})

	it('слой, открытый позже, выше: список в окне — над окном, окно из открытого списка — над списком', async () => {
		const layerIndex = (element: Element | null) => Number((element as HTMLElement).style.getPropertyValue('--rise-layer-index'))
		const { isListOpen, unmount } = renderModalWithList()
		isListOpen.value = true
		await nextTick()
		expect(layerIndex(document.querySelector('.base-dropdown__panel'))).toBeGreaterThan(
			layerIndex(document.querySelector('.base-modal')),
		)
		unmount()

		// Меню на странице открыто, из него открывают окно: окно над меню, хотя в DOM его якорь раньше
		const isMenuOpen = ref(true)
		const isConfirmOpen = ref(false)
		render(
			defineComponent({
				setup: () => () => [
					h(BaseModal, { isOpen: isConfirmOpen.value, title: 'Удалить серию?' }),
					h(
						BaseDropdown,
						{ isOpen: isMenuOpen.value },
						{ default: () => h('button', { type: 'button' }, 'Действия'), dropdown: () => h('span', 'Удалить') },
					),
				],
			}),
		)
		await nextTick()
		isConfirmOpen.value = true
		await nextTick()
		expect(layerIndex(document.querySelector('.base-modal'))).toBeGreaterThan(
			layerIndex(document.querySelector('.base-dropdown__panel')),
		)
	})

	it('Escape, обработанный элементом (панель эмодзи чата), не закрывает окно под ним', async () => {
		const isModalOpen = ref(true)
		render(
			defineComponent({
				setup: () => () =>
					h(
						BaseModal,
						{ isOpen: isModalOpen.value, title: 'Чат', 'onUpdate:isOpen': (value: boolean) => (isModalOpen.value = value) },
						() => h(ChatEmojiPicker, { sizeScale: 100 }),
					),
			}),
		)
		await fireEvent.click(screen.getByRole('button', { name: 'Открыть выбор эмодзи' }))
		expect(screen.getByRole('dialog', { name: 'Эмодзи' })).toBeInTheDocument()

		await fireEvent.keyDown(screen.getAllByRole('button', { name: /Вставить эмодзи/ })[0], { key: 'Escape' })
		expect(screen.queryByRole('dialog', { name: 'Эмодзи' })).toBeNull()
		expect(isModalOpen.value).toBe(true)
	})

	it('нажатие в панели вложенного списка не закрывает внешний', async () => {
		const outerOpen = ref(true)
		const innerOpen = ref(false)
		render(
			defineComponent({
				setup: () => () =>
					h(
						BaseDropdown,
						{ isOpen: outerOpen.value, 'onUpdate:isOpen': (value: boolean) => (outerOpen.value = value) },
						{
							default: () => h('button', { type: 'button' }, 'Фильтры'),
							dropdown: () =>
								h(
									BaseDropdown,
									{ isOpen: innerOpen.value, 'onUpdate:isOpen': (value: boolean) => (innerOpen.value = value) },
									{
										default: () => h('button', { type: 'button' }, 'Статус'),
										dropdown: () => h('button', { type: 'button' }, 'Опубликовано'),
									},
								),
						},
					),
			}),
		)
		innerOpen.value = true
		await nextTick()
		await nextTick()

		await fireEvent.mouseDown(screen.getByRole('button', { name: 'Опубликовано' }))
		expect(outerOpen.value).toBe(true)
		expect(innerOpen.value).toBe(true)

		await fireEvent.mouseDown(document.body)
		expect(innerOpen.value).toBe(false)
		expect(outerOpen.value).toBe(false)
	})

	it('BaseApp teleportTo и createUiKitPlugin({ teleportTo }) задают контейнер слоёв', async () => {
		const layers = document.createElement('div')
		layers.id = 'app-layers'
		document.body.append(layers)

		const { unmount } = render(BaseApp, {
			props: { teleportTo: '#app-layers' },
			slots: { default: () => h(BaseModal, { isOpen: true, title: 'Из BaseApp' }) },
		})
		expect(layers.querySelector('.base-modal')).toHaveTextContent('Из BaseApp')
		unmount()

		render(defineComponent({ render: () => h(BaseModal, { isOpen: true, title: 'Из плагина' }) }), {
			global: { plugins: [createUiKitPlugin({ teleportTo: '#app-layers' })] },
		})
		expect(layers.querySelector('.base-modal')).toHaveTextContent('Из плагина')
		layers.remove()
	})

	it('панель списка в body берёт тему блока, где стоит триггер', async () => {
		render(
			defineComponent({
				render: () =>
					h('section', { 'data-theme': 'dark' }, [
						h(
							BaseDropdown,
							{ isOpen: true },
							{ default: () => h('button', { type: 'button' }, 'Меню'), dropdown: () => h('span', 'Пункт') },
						),
					]),
			}),
		)
		await nextTick()

		expect(document.querySelector('.base-dropdown__panel')).toHaveAttribute('data-theme', 'dark')
	})

	it('меню медиа редактора и меню сообщения чата в body берут тему блока', async () => {
		const isMenuOpen = ref(false)
		render(
			defineComponent({
				setup: () => () =>
					h('section', { 'data-theme': 'dark' }, [
						h(BaseEditor, { modelValue: '<p><img src="data:," alt="Схема"></p>' }),
						h(ChatMessageContextMenu, {
							isOpen: isMenuOpen.value,
							x: 0,
							y: 0,
							message: null,
							currentUserRole: 'member',
							sizeScale: 100,
						}),
					]),
			}),
		)

		await fireEvent.contextMenu(document.querySelector('.base-editor__content img') as HTMLImageElement)
		expect(await screen.findByRole('dialog', { name: 'Размер медиа' })).toHaveAttribute('data-theme', 'dark')

		isMenuOpen.value = true
		await nextTick()
		expect(screen.getByRole('menu', { name: 'Действия с сообщением' })).toHaveAttribute('data-theme', 'dark')
	})
})
