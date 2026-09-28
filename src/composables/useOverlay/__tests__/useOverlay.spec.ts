import { render } from '@testing-library/vue'
import { defineComponent, h, provide } from 'vue'
import {
	createOverlayStore,
	getActiveOverlayStore,
	OVERLAY_DESTROY_DELAY,
	OVERLAY_STORE_KEY,
	setActiveOverlayStore,
	useOverlay,
} from '../useOverlay'
import type { OverlayStore, UseOverlayReturn } from '../types/useOverlay.types'

const Dialog = defineComponent({ name: 'TestDialog', render: () => null })

afterEach(() => {
	setActiveOverlayStore(null)
	vi.restoreAllMocks()
	vi.useRealTimers()
})

describe('createOverlayStore', () => {
	it('открывает оверлей с props и разрешает промис результатом закрытия', async () => {
		const store = createOverlayStore()
		const id = store.register(Dialog, { props: { title: 'Окно' }, destroyOnClose: false })
		const result = store.open<string>(id, { userId: 7 })

		expect(store.isOpen(id)).toBe(true)
		expect(store.entries.value[0].props).toEqual({ title: 'Окно', userId: 7 })

		store.close(id, 'saved')
		store.close(id, 'ignored')
		await expect(result).resolves.toBe('saved')
		expect(store.isOpen(id)).toBe(false)
	})

	it('повторный open открытого оверлея дополняет props и возвращает тот же промис', () => {
		const store = createOverlayStore()
		const id = store.register(Dialog, { props: {}, destroyOnClose: false })
		const first = store.open(id)
		const second = store.open(id, { step: 2 })

		expect(second).toBe(first)
		expect(store.entries.value[0].props).toEqual({ step: 2 })
	})

	it('open и close несуществующего оверлея ничего не делают', async () => {
		const store = createOverlayStore()

		await expect(store.open(42)).resolves.toBeUndefined()
		store.close(42)
		store.patch(42, { a: 1 })
		store.destroyIfClosed(42)
		expect(store.isOpen(42)).toBe(false)
	})

	it('меняет props оверлея', () => {
		const store = createOverlayStore()
		const id = store.register(Dialog, { props: { a: 1 }, destroyOnClose: false })
		store.patch(id, { b: 2 })

		expect(store.entries.value[0].props).toEqual({ a: 1, b: 2 })
	})

	it('удаляет закрытый оверлей после анимации или по запасной задержке', () => {
		vi.useFakeTimers()
		const store = createOverlayStore()
		const byEvent = store.register(Dialog, { props: {}, destroyOnClose: true })
		const byTimer = store.register(Dialog, { props: {}, destroyOnClose: true })
		store.open(byEvent)
		store.open(byTimer)
		store.close(byEvent)
		store.close(byTimer)

		store.destroyIfClosed(byEvent)
		expect(store.entries.value.map(entry => entry.id)).toEqual([byTimer])

		vi.advanceTimersByTime(OVERLAY_DESTROY_DELAY)
		expect(store.entries.value).toEqual([])
	})

	it('не удаляет оверлей, открытый снова до конца задержки, и оверлей без destroyOnClose', () => {
		vi.useFakeTimers()
		const store = createOverlayStore()
		const reopened = store.register(Dialog, { props: {}, destroyOnClose: true })
		const kept = store.register(Dialog, { props: {}, destroyOnClose: false })
		store.open(reopened)
		store.close(reopened)
		store.open(reopened)
		store.open(kept)
		store.close(kept)

		vi.advanceTimersByTime(OVERLAY_DESTROY_DELAY)
		store.destroyIfClosed(kept)
		expect(store.entries.value.map(entry => entry.id)).toEqual([reopened, kept])
	})

	it('destroy закрывает оверлей с результатом undefined и удаляет его', async () => {
		const store = createOverlayStore()
		const id = store.register(Dialog, { props: {}, destroyOnClose: false })
		const result = store.open(id)

		store.destroy(id)

		await expect(result).resolves.toBeUndefined()
		expect(store.entries.value).toEqual([])
	})

	it('closeAll закрывает все открытые оверлеи', () => {
		const store = createOverlayStore()
		const first = store.register(Dialog, { props: {}, destroyOnClose: false })
		const second = store.register(Dialog, { props: {}, destroyOnClose: false })
		store.open(first)
		store.open(second)

		store.closeAll()

		expect(store.isOpen(first) || store.isOpen(second)).toBe(false)
	})
})

describe('useOverlay', () => {
	function mountWithStore(store: OverlayStore): UseOverlayReturn {
		let api!: UseOverlayReturn
		const Child = defineComponent({
			setup() {
				api = useOverlay()
				return () => null
			},
		})
		render(
			defineComponent({
				setup() {
					provide(OVERLAY_STORE_KEY, store)
					return () => h(Child)
				},
			}),
		)
		return api
	}

	it('create регистрирует оверлей только при первом open и открывает его', async () => {
		const store = createOverlayStore()
		const overlay = mountWithStore(store)
		const handle = overlay.create<boolean>(Dialog, { props: { title: 'Окно' } })

		expect(store.entries.value).toEqual([])
		expect(handle.isOpen).toBe(false)

		const result = handle.open({ step: 1 })
		expect(handle.isOpen).toBe(true)
		expect(store.entries.value[0]).toMatchObject({ props: { title: 'Окно', step: 1 }, isOpen: true, destroyOnClose: true })

		handle.patch({ step: 2 })
		expect(store.entries.value[0].props).toEqual({ title: 'Окно', step: 2 })

		handle.close(true)
		await expect(result).resolves.toBe(true)
	})

	it('повторно открывает ту же запись, а после удаления — новую с последними props', async () => {
		const store = createOverlayStore()
		const overlay = mountWithStore(store)
		const handle = overlay.create(Dialog, { props: { a: 1 }, destroyOnClose: false })

		handle.open()
		handle.close()
		handle.open()
		expect(store.entries.value).toHaveLength(1)

		handle.patch({ b: 2 })
		handle.destroy()
		expect(store.entries.value).toEqual([])

		handle.open()
		expect(store.entries.value[0].props).toEqual({ a: 1, b: 2 })
		overlay.closeAll()
		expect(handle.isOpen).toBe(false)
	})

	it('методы неоткрытого оверлея ничего не делают', () => {
		const store = createOverlayStore()
		const overlay = mountWithStore(store)
		const handle = overlay.create(Dialog)

		handle.close()
		handle.patch({ a: 1 })
		handle.destroy()
		expect(store.entries.value).toEqual([])
	})

	it('вне дерева BaseApp использует последний смонтированный', () => {
		const store = createOverlayStore()
		setActiveOverlayStore(store)
		useOverlay().create(Dialog).open()

		expect(getActiveOverlayStore()).toBe(store)
		expect(store.entries.value).toHaveLength(1)
	})

	it('без BaseApp предупреждает и разрешает open сразу', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const overlay = useOverlay()

		await expect(overlay.create(Dialog).open()).resolves.toBeUndefined()
		overlay.closeAll()
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('не найден <BaseApp>'))
	})
})
