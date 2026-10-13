import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { useChatListScroll } from '../model/timeline/useChatListScroll'

const ITEM_HEIGHT = 100
const VIEWPORT = 400

const scrollTops = new WeakMap<Element, number>()
const originals = new Map<string, PropertyDescriptor | undefined>()

function patch(name: string, descriptor: PropertyDescriptor): void {
	originals.set(name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name))
	Object.defineProperty(HTMLElement.prototype, name, { configurable: true, ...descriptor })
}

beforeAll(() => {
	patch('scrollHeight', {
		get(this: HTMLElement) {
			return this.classList.contains('list') ? this.querySelectorAll('.item').length * ITEM_HEIGHT : 0
		},
	})
	patch('clientHeight', {
		get(this: HTMLElement) {
			return this.classList.contains('list') ? VIEWPORT : 0
		},
	})
	patch('scrollTop', {
		get(this: HTMLElement) {
			return scrollTops.get(this) ?? 0
		},
		set(this: HTMLElement, value: number) {
			scrollTops.set(this, value)
		},
	})
	patch('offsetTop', {
		get(this: HTMLElement) {
			return Number(this.dataset.top ?? 0)
		},
	})
})

afterAll(() => {
	for (const [name, descriptor] of originals) {
		if (descriptor) Object.defineProperty(HTMLElement.prototype, name, descriptor)
		else Reflect.deleteProperty(HTMLElement.prototype, name)
	}
})

afterEach(() => {
	vi.restoreAllMocks()
})

interface State {
	ids: string[]
	lastOwn: boolean
	hasUnread: boolean
	unreadTop: number
	canLoadMore: boolean
}

function setup(initial: Partial<State> = {}) {
	const state = reactive<State>({
		ids: ['a', 'b', 'c', 'd', 'e', 'f'],
		lastOwn: false,
		hasUnread: false,
		unreadTop: 300,
		canLoadMore: false,
		...initial,
	})
	const onLoadMore = vi.fn<() => void>()
	let api!: ReturnType<typeof useChatListScroll>
	const Host = defineComponent({
		setup() {
			const listRef = ref<HTMLElement | null>(null)
			api = useChatListScroll(listRef, {
				hasUnread: () => state.hasUnread,
				isLastOwn: () => state.lastOwn,
				getEndKey: () => state.ids[state.ids.length - 1],
				getLastId: () => state.ids[state.ids.length - 1],
				isSmooth: () => false,
				getFirstId: () => state.ids[0],
				hasIdBefore: id => state.ids.indexOf(id) > 0,
				canLoadMore: () => state.canLoadMore,
				onLoadMore,
			})
			return () =>
				h('div', { ref: listRef, class: 'list' }, [
					...state.ids.map(id => h('div', { key: id, class: 'item' })),
					state.hasUnread
						? h('div', { class: 'unread-divider', 'data-chat-unread': '', 'data-top': String(state.unreadTop) })
						: null,
				])
		},
	})
	const view = render(Host)
	const list = view.container.querySelector('.list') as HTMLElement
	return { api, state, list, onLoadMore, view }
}

function setScroll(list: HTMLElement, top: number): void {
	list.scrollTop = top
}

describe('useChatListScroll', () => {
	describe('автопрокрутка', () => {
		it('при монтировании без непрочитанных лента встаёт в конец', async () => {
			const { list } = setup()
			await nextTick()

			expect(list.scrollTop).toBe(6 * ITEM_HEIGHT)
		})

		it('новое чужое сообщение, пока читатель у низа, прокручивает ленту к низу и кнопки нет', async () => {
			const { api, state, list } = setup()
			await nextTick()
			setScroll(list, 6 * ITEM_HEIGHT - VIEWPORT - 10)
			api.handleEdgeScroll()

			state.ids.push('g')
			await nextTick()
			await nextTick()

			expect(list.scrollTop).toBe(7 * ITEM_HEIGHT)
			expect(api.hasNewBelow.value).toBe(false)
		})

		it('новое чужое сообщение, пока читатель выше 48px от низа, не двигает ленту и показывает «Новые сообщения»', async () => {
			const { api, state, list } = setup()
			await nextTick()
			setScroll(list, 100)
			api.handleEdgeScroll()

			state.ids.push('g')
			await nextTick()
			await nextTick()

			expect(list.scrollTop).toBe(100)
			expect(api.hasNewBelow.value).toBe(true)
		})

		it('ровно 48px до низа ещё считается «у низа»', async () => {
			const { api, state, list } = setup()
			await nextTick()
			setScroll(list, 6 * ITEM_HEIGHT - VIEWPORT - 48)
			api.handleEdgeScroll()

			state.ids.push('g')
			await nextTick()
			await nextTick()

			expect(list.scrollTop).toBe(7 * ITEM_HEIGHT)
			expect(api.hasNewBelow.value).toBe(false)
		})

		it('своё сообщение прокручивает ленту к низу, даже если читали историю, и кнопки нет', async () => {
			const { api, state, list } = setup()
			await nextTick()
			setScroll(list, 100)
			api.handleEdgeScroll()

			state.lastOwn = true
			state.ids.push('g')
			await nextTick()
			await nextTick()

			expect(list.scrollTop).toBe(7 * ITEM_HEIGHT)
			expect(api.hasNewBelow.value).toBe(false)
		})

		it('возврат к низу руками гасит кнопку «Новые сообщения»', async () => {
			const { api, state, list } = setup()
			await nextTick()
			setScroll(list, 100)
			api.handleEdgeScroll()
			state.ids.push('g')
			await nextTick()
			expect(api.hasNewBelow.value).toBe(true)

			setScroll(list, 7 * ITEM_HEIGHT - VIEWPORT)
			api.handleEdgeScroll()

			expect(api.hasNewBelow.value).toBe(false)
		})

		it('кнопка «Новые сообщения» прокручивает вниз и скрывается, а автопрокрутка после неё не включается сама', async () => {
			const { api, state, list } = setup()
			await nextTick()
			setScroll(list, 100)
			api.handleEdgeScroll()
			state.ids.push('g')
			await nextTick()
			await nextTick()

			api.handleJumpToNew()
			await nextTick()

			expect(list.scrollTop).toBe(7 * ITEM_HEIGHT)
			expect(api.hasNewBelow.value).toBe(false)

			setScroll(list, 100)
			api.handleEdgeScroll()
			state.ids.push('h')
			await nextTick()
			await nextTick()
			expect(list.scrollTop).toBe(100)
		})

		it('без элемента ленты прокрутка по краю ничего не делает', async () => {
			const { api, view } = setup()
			view.unmount()

			expect(() => api.handleEdgeScroll()).not.toThrow()
		})
	})

	describe('непрочитанные', () => {
		it('при непрочитанных лента не уходит в конец, а встаёт на разделитель с отступом', async () => {
			const { list } = setup({ hasUnread: true, unreadTop: 300 })
			await nextTick()

			expect(list.scrollTop).toBe(276)
		})

		it('разделитель у самого верха не даёт отрицательной прокрутки', async () => {
			const { list } = setup({ hasUnread: true, unreadTop: 10 })
			await nextTick()

			expect(list.scrollTop).toBe(0)
		})

		it('новое чужое сообщение при ленте на непрочитанных показывает кнопку, а не прокручивает', async () => {
			const { api, state, list } = setup({ hasUnread: true })
			await nextTick()

			state.ids.push('g')
			await nextTick()
			await nextTick()

			expect(list.scrollTop).toBe(276)
			expect(api.hasNewBelow.value).toBe(true)
		})

		it('непрочитанные без отрисованного разделителя не ломают монтирование', async () => {
			const { list, state } = setup()
			state.hasUnread = true
			await nextTick()

			expect(list.querySelector('[data-chat-unread]')).not.toBeNull()
		})
	})

	describe('подгрузка истории', () => {
		it('у верхней границы (<=48px) просит более старые сообщения', async () => {
			const { api, list, onLoadMore } = setup({ canLoadMore: true })
			await nextTick()
			setScroll(list, 48)

			api.handleHistoryScroll()

			expect(onLoadMore).toHaveBeenCalledOnce()
		})

		it('дальше 48px от верха подгрузки нет', async () => {
			const { api, list, onLoadMore } = setup({ canLoadMore: true })
			await nextTick()
			setScroll(list, 49)

			api.handleHistoryScroll()

			expect(onLoadMore).not.toHaveBeenCalled()
		})

		it('без hasMoreMessages или во время подгрузки событие не отправляется', async () => {
			const { api, list, onLoadMore } = setup({ canLoadMore: false })
			await nextTick()
			setScroll(list, 0)

			api.handleHistoryScroll()

			expect(onLoadMore).not.toHaveBeenCalled()
		})

		it('без элемента ленты прокрутка ничего не просит', async () => {
			const { api, onLoadMore, view } = setup({ canLoadMore: true })
			view.unmount()

			api.handleHistoryScroll()

			expect(onLoadMore).not.toHaveBeenCalled()
		})

		it('при монтировании просит ещё, если сообщения не заполняют ленту', () => {
			const { onLoadMore } = setup({ canLoadMore: true, ids: ['a', 'b'] })

			expect(onLoadMore).toHaveBeenCalledOnce()
		})

		it('при монтировании не просит, если лента заполнена или подгружать нечего', () => {
			const filled = setup({ canLoadMore: true })
			const nothing = setup({ canLoadMore: false, ids: ['a'] })

			expect(filled.onLoadMore).not.toHaveBeenCalled()
			expect(nothing.onLoadMore).not.toHaveBeenCalled()
		})
	})

	describe('позиция при добавлении истории сверху', () => {
		it('сохраняет положение читателя: прежняя верхняя точка остаётся на месте', async () => {
			const { state, list } = setup({ ids: ['d', 'e', 'f', 'g', 'h', 'i'] })
			await nextTick()
			setScroll(list, 50)

			state.ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
			await nextTick()
			await nextTick()

			expect(list.scrollTop).toBe(50 + 3 * ITEM_HEIGHT)
		})

		it('новое сообщение снизу позицию не меняет', async () => {
			const { api, state, list } = setup()
			await nextTick()
			setScroll(list, 100)
			api.handleEdgeScroll()

			state.ids = [...state.ids, 'g']
			await nextTick()
			await nextTick()

			expect(list.scrollTop).toBe(100)
		})

		it('замена всей ленты (другой чат) позицию не сохраняет', async () => {
			const { api, state, list } = setup()
			await nextTick()
			setScroll(list, 100)
			api.handleEdgeScroll()

			state.ids = ['x', 'y', 'z', 'w', 'v', 'u']
			await nextTick()
			await nextTick()

			expect(list.scrollTop).toBe(100)
		})

		it('первая загрузка в пустую ленту позицию не подстраивает', async () => {
			const { state, list } = setup({ ids: [], hasUnread: true })
			await nextTick()
			setScroll(list, 0)

			state.ids = ['a', 'b']
			await nextTick()
			await nextTick()

			expect(list.scrollTop).toBe(0)
		})
	})
})
