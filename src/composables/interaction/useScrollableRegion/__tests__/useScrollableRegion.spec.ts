import '@testing-library/jest-dom/vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { render, screen } from '@testing-library/vue'
import { useScrollableRegion } from '../useScrollableRegion'
import type { ScrollableRegionOrientation } from '../types/useScrollableRegion.types'

/** Экземпляры подменённого ResizeObserver: колбэк, наблюдаемые элементы и вызовы disconnect */
const observers: { callback: () => void; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = []

class ResizeObserverMock {
	observe = vi.fn()
	disconnect = vi.fn()
	constructor(callback: () => void) {
		observers.push({ callback, observe: this.observe, disconnect: this.disconnect })
	}
	unobserve(): void {}
}

/** Хост: область появляется через v-if, признак прокрутки выводится в data-атрибут */
const Host = defineComponent({
	props: {
		isShown: { type: Boolean, default: false },
		orientation: { type: String as () => ScrollableRegionOrientation | undefined, default: undefined },
	},
	setup(props) {
		const regionRef = ref<HTMLElement | null>(null)
		const { isScrollable } = useScrollableRegion({ elementRef: regionRef, orientation: props.orientation })
		return { regionRef, isScrollable }
	},
	template: `
		<div>
			<span data-testid="state">{{ isScrollable }}</span>
			<div v-if="isShown" ref="regionRef" data-testid="region">Текст</div>
		</div>
	`,
})

/** Хост с содержимым: строки задаются пропсом, `update` — ручной пересчёт */
const ContentHost = defineComponent({
	props: {
		items: { type: Array as () => string[], default: () => ['Строка 1'] },
		orientation: { type: String as () => ScrollableRegionOrientation | undefined, default: undefined },
	},
	setup(props) {
		const regionRef = ref<HTMLElement | null>(null)
		const { isScrollable, update } = useScrollableRegion({ elementRef: regionRef, orientation: props.orientation })
		return { regionRef, isScrollable, update }
	},
	template: `
		<div>
			<span data-testid="state">{{ isScrollable }}</span>
			<button data-testid="update" @click="update">Пересчитать</button>
			<div ref="regionRef" data-testid="region">
				<p v-for="item in items" :key="item" data-testid="row"><span>{{ item }}</span></p>
			</div>
		</div>
	`,
})

/** Ширина области: scrollWidth и clientWidth подменяются, как и высота */
function mockWidth(scrollWidth: number, clientWidth: number): void {
	vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth)
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(clientWidth)
}

/** Колбэки MutationObserver приходят микрозадачей, пересчёт признака — к следующему тику */
async function flushMutations(): Promise<void> {
	await Promise.resolve()
	await nextTick()
}

/** Размеры области: jsdom не считает раскладку, поэтому scrollHeight и clientHeight подменяются */
function mockSize(scrollHeight: number, clientHeight: number): void {
	vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(scrollHeight)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(clientHeight)
}

describe('useScrollableRegion', () => {
	const originalResizeObserver = globalThis.ResizeObserver

	beforeEach(() => {
		observers.length = 0
		globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
	})

	afterEach(() => {
		globalThis.ResizeObserver = originalResizeObserver
	})

	it('без элемента область не прокручивается', () => {
		render(Host)

		expect(screen.getByTestId('state')).toHaveTextContent('false')
		expect(observers).toHaveLength(0)
	})

	it('содержимое выше области → isScrollable=true сразу после появления элемента', async () => {
		mockSize(600, 300)
		const { rerender } = render(Host)

		await rerender({ isShown: true })
		await nextTick()

		expect(screen.getByTestId('state')).toHaveTextContent('true')
		expect(observers[0]?.observe).toHaveBeenCalledWith(screen.getByTestId('region'))
	})

	it('содержимое помещается → isScrollable=false', async () => {
		mockSize(300, 300)
		const { rerender } = render(Host)

		await rerender({ isShown: true })
		await nextTick()

		expect(screen.getByTestId('state')).toHaveTextContent('false')
	})

	it('пересчитывает признак, когда ResizeObserver сообщает о новом размере', async () => {
		mockSize(300, 300)
		const { rerender } = render(Host)
		await rerender({ isShown: true })
		await nextTick()
		expect(screen.getByTestId('state')).toHaveTextContent('false')

		// Окно упёрлось в предел по высоте: область стала ниже содержимого
		mockSize(600, 300)
		observers[0]?.callback()
		await nextTick()

		expect(screen.getByTestId('state')).toHaveTextContent('true')
	})

	it('при исчезновении элемента сбрасывает признак и отключает наблюдатель', async () => {
		mockSize(600, 300)
		const { rerender } = render(Host)
		await rerender({ isShown: true })
		await nextTick()

		await rerender({ isShown: false })
		await nextTick()

		expect(screen.getByTestId('state')).toHaveTextContent('false')
		expect(observers[0]?.disconnect).toHaveBeenCalled()
	})

	it('horizontal: прокрутка по ширине — scrollWidth больше clientWidth, высота не важна', async () => {
		mockSize(600, 300)
		vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(300)
		vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300)
		const { rerender } = render(Host, { props: { orientation: 'horizontal' } })
		await rerender({ isShown: true })
		await nextTick()
		expect(screen.getByTestId('state')).toHaveTextContent('false')

		vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(720)
		observers[0]?.callback()
		await nextTick()

		expect(screen.getByTestId('state')).toHaveTextContent('true')
	})

	it('отключает наблюдатель при размонтировании', async () => {
		mockSize(600, 300)
		const { rerender, unmount } = render(Host)
		await rerender({ isShown: true })
		await nextTick()

		unmount()

		expect(observers[0]?.disconnect).toHaveBeenCalled()
	})

	it('vertical по умолчанию не реагирует на горизонтальную прокрутку', async () => {
		mockSize(300, 300)
		mockWidth(900, 300)
		render(ContentHost)
		await nextTick()

		expect(screen.getByTestId('state')).toHaveTextContent('false')
	})

	it.each([
		{ name: 'только по высоте', height: [600, 300], width: [300, 300], expected: 'true' },
		{ name: 'только по ширине', height: [300, 300], width: [900, 300], expected: 'true' },
		{ name: 'по обеим осям', height: [600, 300], width: [900, 300], expected: 'true' },
		{ name: 'содержимое помещается', height: [300, 300], width: [300, 300], expected: 'false' },
	])('both: $name → isScrollable=$expected', async ({ height, width, expected }) => {
		mockSize(height[0], height[1])
		mockWidth(width[0], width[1])
		render(ContentHost, { props: { orientation: 'both' } })
		await nextTick()

		expect(screen.getByTestId('state')).toHaveTextContent(expected)
	})

	it('наблюдает не только сам элемент, но и его прямых потомков', async () => {
		render(ContentHost, { props: { items: ['Строка 1', 'Строка 2'] } })
		await nextTick()

		const observed = observers[0]?.observe.mock.calls.map(([element]) => element)
		expect(observed).toEqual([screen.getByTestId('region'), ...screen.getAllByTestId('row')])
	})

	it('содержимое выросло без смены размера области → признак появляется по ResizeObserver потомка', async () => {
		mockSize(300, 300)
		render(ContentHost)
		await nextTick()
		expect(screen.getByTestId('state')).toHaveTextContent('false')

		mockSize(640, 300)
		observers[0]?.callback()
		await nextTick()

		expect(screen.getByTestId('state')).toHaveTextContent('true')
	})

	it('содержимое уменьшилось → признак снимается', async () => {
		mockSize(640, 300)
		render(ContentHost)
		await nextTick()
		expect(screen.getByTestId('state')).toHaveTextContent('true')

		mockSize(300, 300)
		observers[0]?.callback()
		await nextTick()

		expect(screen.getByTestId('state')).toHaveTextContent('false')
	})

	it('добавлены строки → признак пересчитан, новые потомки под наблюдением', async () => {
		mockSize(300, 300)
		const { rerender } = render(ContentHost)
		await nextTick()
		const observe = observers[0]?.observe
		observe?.mockClear()

		mockSize(900, 300)
		await rerender({ items: ['Строка 1', 'Строка 2', 'Строка 3'] })
		await flushMutations()

		expect(screen.getByTestId('state')).toHaveTextContent('true')
		expect(observe?.mock.calls.map(([element]) => element)).toEqual([screen.getByTestId('region'), ...screen.getAllByTestId('row')])
	})

	it('строки убраны → признак снят', async () => {
		mockSize(900, 300)
		const { rerender } = render(ContentHost, { props: { items: ['Строка 1', 'Строка 2', 'Строка 3'] } })
		await nextTick()
		expect(screen.getByTestId('state')).toHaveTextContent('true')

		mockSize(300, 300)
		await rerender({ items: ['Строка 1'] })
		await flushMutations()

		expect(screen.getByTestId('state')).toHaveTextContent('false')
	})

	it('изменения глубже прямых потомков пересчитывают признак, не пересобирая наблюдение', async () => {
		mockSize(300, 300)
		render(ContentHost)
		await nextTick()
		const observe = observers[0]?.observe
		observe?.mockClear()

		mockSize(500, 300)
		const text = screen.getAllByTestId('row')[0]?.querySelector('span')?.firstChild as Text
		text.data = 'Строка 1 — длиннее, не помещается'
		await flushMutations()

		expect(screen.getByTestId('state')).toHaveTextContent('true')
		expect(observe).not.toHaveBeenCalled()
	})

	it('update() пересчитывает признак вручную', async () => {
		mockSize(300, 300)
		render(ContentHost)
		await nextTick()

		mockSize(800, 300)
		screen.getByTestId('update').click()
		await nextTick()

		expect(screen.getByTestId('state')).toHaveTextContent('true')
	})

	it('при размонтировании отключает и MutationObserver', async () => {
		const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
		const { unmount } = render(ContentHost)
		await nextTick()

		unmount()

		expect(disconnect).toHaveBeenCalled()
	})
})
