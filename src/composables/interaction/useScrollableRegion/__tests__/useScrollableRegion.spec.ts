import '@testing-library/jest-dom/vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { render, screen } from '@testing-library/vue'
import { useScrollableRegion } from '../useScrollableRegion'

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
	props: { isShown: { type: Boolean, default: false } },
	setup() {
		const regionRef = ref<HTMLElement | null>(null)
		const { isScrollable } = useScrollableRegion({ elementRef: regionRef })
		return { regionRef, isScrollable }
	},
	template: `
		<div>
			<span data-testid="state">{{ isScrollable }}</span>
			<div v-if="isShown" ref="regionRef" data-testid="region">Текст</div>
		</div>
	`,
})

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

	it('отключает наблюдатель при размонтировании', async () => {
		mockSize(600, 300)
		const { rerender, unmount } = render(Host)
		await rerender({ isShown: true })
		await nextTick()

		unmount()

		expect(observers[0]?.disconnect).toHaveBeenCalled()
	})
})
