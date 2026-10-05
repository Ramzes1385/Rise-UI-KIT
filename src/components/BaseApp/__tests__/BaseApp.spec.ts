import '@testing-library/jest-dom/vitest'
import BaseApp from '../ui/BaseApp.vue'
import { defineComponent, h } from 'vue'
import { getLocale, setLocale } from '@/locales/state'
import type { UseToastReturn } from '@composables/app/useToast'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BaseAppToasterOptions } from '../types/BaseApp.types'
import { useTeleportTarget } from '@composables/app/useTeleportTarget'
import type { UseOverlayReturn } from '@composables/overlay/useOverlay'
import { getActiveToastStore, useToast } from '@composables/app/useToast'
import { getActiveOverlayStore, useOverlay } from '@composables/overlay/useOverlay'

const TestDialog = defineComponent({
	name: 'TestDialog',
	props: { isOpen: Boolean, name: { type: String, default: '' } },
	emits: ['close', 'update:isOpen', 'after-leave'],
	setup(props, { emit }) {
		return () =>
			h('div', [
				props.isOpen
					? h('div', { role: 'dialog', 'aria-label': `Диалог ${props.name}` }, [
							h('button', { type: 'button', onClick: () => emit('close', `готово:${props.name}`) }, 'Готово'),
							h('button', { type: 'button', onClick: () => emit('update:isOpen', false) }, 'Скрыть'),
							h('button', { type: 'button', onClick: () => emit('update:isOpen', true) }, 'Остаться'),
						])
					: null,
				h('button', { type: 'button', onClick: () => emit('after-leave') }, `Анимация ${props.name} закончилась`),
			])
	},
})

function renderApp(toaster?: BaseAppToasterOptions) {
	const api = {} as { toast: UseToastReturn; overlay: UseOverlayReturn }
	const Page = defineComponent({
		setup() {
			api.toast = useToast()
			api.overlay = useOverlay()
			return () => h('main', { 'data-testid': 'page' }, 'Приложение')
		},
	})
	const utils = render(BaseApp, { props: { toaster }, slots: { default: () => h(Page) } })
	return { ...utils, ...api }
}

describe('BaseApp', () => {
	it('рендерит приложение без обёртки и не переносит атрибуты', () => {
		const { container } = render(BaseApp, {
			attrs: { class: 'lost', 'data-x': '1' },
			slots: { default: () => h('main', 'Приложение') },
			global: { stubs: { Transition: false } },
		})

		expect(container.firstElementChild?.tagName).toBe('MAIN')
		expect(document.querySelector('.lost, [data-x]')).not.toBeInTheDocument()
	})

	it('передаёт цель телепорта из пропа teleportTo компонентам внутри', () => {
		const layer = document.createElement('div')
		document.body.append(layer)
		let target: unknown
		const Child = defineComponent({
			setup() {
				target = useTeleportTarget()
				return () => h('main', 'Приложение')
			},
		})
		const { unmount } = render(BaseApp, { props: { teleportTo: layer }, slots: { default: () => h(Child) } })

		expect(target).toBe(layer)
		unmount()
		layer.remove()
	})

	it('ставит язык кита из пропа locale', () => {
		render(BaseApp, { props: { locale: 'en' }, slots: { default: () => h('main', 'Приложение') } })

		expect(getLocale().code).toBe('en')
		setLocale('ru')
	})

	describe('уведомления', () => {
		it('показывает уведомления useToast() и закрывает их кнопкой', async () => {
			const { toast } = renderApp()

			const id = toast.add({ title: 'Сохранено', type: 'success' })
			expect(await screen.findByRole('status')).toHaveTextContent('Сохранено')

			toast.update(id, { title: 'Сохранено в облако' })
			expect(await screen.findByText('Сохранено в облако')).toBeInTheDocument()

			await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
			expect(toast.toasts.value).toEqual([])
			expect(screen.queryByRole('status')).not.toBeInTheDocument()
		})

		it('применяет настройки toaster: угол, оформление, масштаб, лимит', async () => {
			const { toast } = renderApp({ position: 'bottom-center', variant: 'soft', sizeScale: 120, duration: 5000, max: 2 })

			toast.add({ title: '1' })
			toast.add({ title: '2' })
			toast.add({ title: '3' })

			const region = await screen.findByRole('region', { name: 'Уведомления' })
			expect(region).toHaveClass('base-notification--bottom-center')
			const items = document.querySelectorAll<HTMLElement>('.base-notification-item')
			expect(Array.from(items, item => item.textContent?.trim().charAt(0))).toEqual(['3', '2'])
			expect(items[0]).toHaveClass('base-notification-item--soft')
			expect((items[0].querySelector('.base-notification-item__progress') as HTMLElement).style.animationDuration).toBe('5000ms')
			expect(region.style.getPropertyValue('--size-scale')).toBe('1.2')
		})

		it('делает свои хранилища активными и снимает их при размонтировании', () => {
			const { unmount } = renderApp()
			const toastStore = getActiveToastStore()
			const overlayStore = getActiveOverlayStore()
			expect(toastStore).not.toBeNull()
			expect(overlayStore).not.toBeNull()

			unmount()

			expect(getActiveToastStore()).toBeNull()
			expect(getActiveOverlayStore()).toBeNull()
		})

		it('размонтирование старого BaseApp не снимает хранилища нового', async () => {
			const first = renderApp()
			const second = renderApp()
			const active = getActiveToastStore()

			first.unmount()

			expect(getActiveToastStore()).toBe(active)
			second.toast.add({ title: 'Из второго' })
			expect(await screen.findByText('Из второго')).toBeInTheDocument()
		})
	})

	describe('оверлеи', () => {
		it('рендерит оверлей с props; close передаёт результат в промис', async () => {
			const { overlay } = renderApp()
			const dialog = overlay.create<string>(TestDialog, { props: { name: 'профиля' } })

			const result = dialog.open()
			expect(await screen.findByRole('dialog', { name: 'Диалог профиля' })).toBeInTheDocument()

			await fireEvent.click(screen.getByRole('button', { name: 'Готово' }))
			await expect(result).resolves.toBe('готово:профиля')
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		})

		it('update:isOpen false закрывает без результата, true ничего не меняет', async () => {
			const { overlay } = renderApp()
			const dialog = overlay.create(TestDialog, { props: { name: 'A' } })

			const result = dialog.open()
			await screen.findByRole('dialog', { name: 'Диалог A' })
			await fireEvent.click(screen.getByRole('button', { name: 'Остаться' }))
			expect(dialog.isOpen).toBe(true)

			await fireEvent.click(screen.getByRole('button', { name: 'Скрыть' }))
			await expect(result).resolves.toBeUndefined()
			expect(dialog.isOpen).toBe(false)
		})

		it('after-leave удаляет закрытый оверлей сразу, открытый — нет', async () => {
			const { overlay } = renderApp()
			const dialog = overlay.create(TestDialog, { props: { name: 'B' } })

			dialog.open()
			await screen.findByRole('dialog', { name: 'Диалог B' })
			await fireEvent.click(screen.getByRole('button', { name: 'Анимация B закончилась' }))
			expect(screen.getByRole('dialog', { name: 'Диалог B' })).toBeInTheDocument()

			await fireEvent.click(screen.getByRole('button', { name: 'Скрыть' }))
			expect(getActiveOverlayStore()?.entries.value).toHaveLength(1)
			await fireEvent.click(screen.getByRole('button', { name: 'Анимация B закончилась' }))

			expect(getActiveOverlayStore()?.entries.value).toHaveLength(0)
			expect(screen.queryByRole('button', { name: 'Анимация B закончилась' })).not.toBeInTheDocument()
		})

		it('при размонтировании закрывает открытые оверлеи: await не зависает', async () => {
			const { overlay, unmount } = renderApp()
			const result = overlay.create(TestDialog).open()

			unmount()

			await expect(result).resolves.toBeUndefined()
		})
	})
})
