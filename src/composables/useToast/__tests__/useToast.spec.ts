import { render } from '@testing-library/vue'
import { defineComponent, h, provide } from 'vue'
import { createToastStore, getActiveToastStore, setActiveToastStore, TOAST_MAX, TOAST_STORE_KEY, useToast } from '../useToast'
import type { ToastStore, UseToastReturn } from '../types/useToast.types'

afterEach(() => {
	setActiveToastStore(null)
	vi.restoreAllMocks()
})

describe('createToastStore', () => {
	it('добавляет уведомление первым и выдаёт id', () => {
		const store = createToastStore()
		const first = store.add({ title: 'Первое' })
		const second = store.add({ title: 'Второе' })

		expect(first).not.toBe(second)
		expect(store.items.value.map(item => item.title)).toEqual(['Второе', 'Первое'])
	})

	it('заменяет уведомление с тем же своим id, а не добавляет второе', () => {
		const store = createToastStore()
		store.add({ id: 'save', title: 'Сохраняем…', isPersistent: true })
		store.add({ id: 'other', title: 'Другое' })
		const id = store.add({ id: 'save', title: 'Сохранено', type: 'success' })

		expect(id).toBe('save')
		expect(store.items.value).toEqual([
			{ id: 'other', title: 'Другое' },
			{ id: 'save', title: 'Сохранено', type: 'success' },
		])
	})

	it('закрывает самые старые уведомления сверх лимита', () => {
		const store = createToastStore({ max: () => 2 })
		store.add({ title: '1' })
		store.add({ title: '2' })
		store.add({ title: '3' })

		expect(store.items.value.map(item => item.title)).toEqual(['3', '2'])
	})

	it(`по умолчанию показывает не больше ${TOAST_MAX}`, () => {
		const store = createToastStore()
		for (let index = 0; index < TOAST_MAX + 2; index++) store.add({ title: String(index) })

		expect(store.items.value).toHaveLength(TOAST_MAX)
	})

	it('меняет показанное уведомление и игнорирует неизвестный id', () => {
		const store = createToastStore()
		const id = store.add({ title: 'Загрузка', isPersistent: true })
		store.update(id, { title: 'Готово', isPersistent: false })
		store.update('missing', { title: 'Нет' })

		expect(store.items.value).toEqual([{ id, title: 'Готово', isPersistent: false }])
	})

	it('закрывает одно и все уведомления', () => {
		const store = createToastStore()
		const id = store.add({ title: '1' })
		store.add({ title: '2' })
		store.remove(id)
		expect(store.items.value.map(item => item.title)).toEqual(['2'])

		store.clear()
		expect(store.items.value).toEqual([])
	})
})

describe('useToast', () => {
	function mountWithStore(store: ToastStore): UseToastReturn {
		let api!: UseToastReturn
		const Child = defineComponent({
			setup() {
				api = useToast()
				return () => null
			},
		})
		render(
			defineComponent({
				setup() {
					provide(TOAST_STORE_KEY, store)
					return () => h(Child)
				},
			}),
		)
		return api
	}

	it('внутри BaseApp работает со своим хранилищем', () => {
		const store = createToastStore()
		const other = createToastStore()
		setActiveToastStore(other)
		const toast = mountWithStore(store)

		const id = toast.add({ title: 'Сохранено' })
		toast.update(id, { description: 'Изменения видны всем' })

		expect(store.items.value).toEqual([{ id, title: 'Сохранено', description: 'Изменения видны всем' }])
		expect(toast.toasts.value).toBe(store.items.value)
		expect(other.items.value).toEqual([])

		toast.remove(id)
		toast.add({ title: 'Ещё' })
		toast.clear()
		expect(store.items.value).toEqual([])
	})

	it('вне дерева BaseApp использует последний смонтированный', () => {
		const store = createToastStore()
		setActiveToastStore(store)
		const toast = useToast()

		toast.add({ title: 'Из стора' })

		expect(getActiveToastStore()).toBe(store)
		expect(toast.toasts.value.map(item => item.title)).toEqual(['Из стора'])
	})

	it('без BaseApp предупреждает и ничего не показывает', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const toast = useToast()

		expect(toast.add({ id: 'x', title: 'Потеряно' })).toBe('x')
		expect(toast.add({ title: 'Без id' })).toBe('')
		toast.update('x', { title: 'Нет' })
		toast.remove('x')
		toast.clear()

		expect(toast.toasts.value).toEqual([])
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('не найден <BaseApp>'))
	})
})
