import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { getOpenLayers, useLayer, useLayerIndex } from '../useLayerStack'
import type { LayerOptions } from '../useLayerStack.types'

function mountLayer(options: LayerOptions) {
	return render(
		defineComponent({
			setup() {
				useLayer(options)
				return () => h('div')
			},
		}),
	)
}

function pressEscape(init: KeyboardEventInit = {}): KeyboardEvent {
	const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true, ...init })
	document.body.dispatchEvent(event)
	return event
}

describe('useLayer', () => {
	it('Escape получает только верхний открытый слой', async () => {
		const modalOpen = ref(true)
		const listOpen = ref(false)
		const closeModal = vi.fn(() => (modalOpen.value = false))
		const closeList = vi.fn(() => (listOpen.value = false))
		mountLayer({ isActive: () => listOpen.value, onEscape: closeList })
		mountLayer({ isActive: () => modalOpen.value, onEscape: closeModal })

		// Список создан раньше окна, но открыт позже — он выше
		listOpen.value = true
		await nextTick()
		pressEscape()
		expect(closeList).toHaveBeenCalledTimes(1)
		expect(closeModal).not.toHaveBeenCalled()

		await nextTick()
		pressEscape()
		expect(closeModal).toHaveBeenCalledTimes(1)
	})

	it('слои без обработчика Escape пропускаются; другие клавиши, обработанное событие и Escape в IME — нет', () => {
		const onEscape = vi.fn()
		mountLayer({ isActive: () => true, onEscape })
		mountLayer({ isActive: () => true, elements: () => [] })

		document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
		const handled = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
		handled.preventDefault()
		document.body.dispatchEvent(handled)
		pressEscape({ isComposing: true })
		expect(onEscape).not.toHaveBeenCalled()

		pressEscape()
		expect(onEscape).toHaveBeenCalledTimes(1)
	})

	it('без открытых слоёв Escape ничего не делает', () => {
		mountLayer({ isActive: () => false, onEscape: vi.fn() })

		expect(() => pressEscape()).not.toThrow()
		expect(getOpenLayers()).toEqual([])
	})

	it('слой без элементов считает нажатием вне любое нажатие; пустой элемент в списке пропускается', () => {
		const onPointerDownOutside = vi.fn()
		mountLayer({ isActive: () => true, onPointerDownOutside })
		const inside = vi.fn()
		const panel = document.createElement('div')
		document.body.append(panel)
		mountLayer({ isActive: () => true, elements: () => [null, panel], onPointerDownOutside: inside })

		document.dispatchEvent(new MouseEvent('mousedown'))
		expect(onPointerDownOutside).toHaveBeenCalledTimes(1)
		expect(inside).toHaveBeenCalledTimes(1)

		panel.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
		// Нажатие в слое, открытом позже, — внутри и для нижнего слоя
		expect(onPointerDownOutside).toHaveBeenCalledTimes(1)
		expect(inside).toHaveBeenCalledTimes(1)
		panel.remove()
	})

	it('цель, удалённая из DOM до обработки, всё ещё внутри слоя: путь события сохраняется', () => {
		const onPointerDownOutside = vi.fn()
		const panel = document.createElement('div')
		const item = document.createElement('button')
		panel.append(item)
		document.body.append(panel)
		mountLayer({ isActive: () => true, elements: () => [panel], onPointerDownOutside })
		// Обработчик на элементе убирает пункт раньше, чем событие дойдёт до document
		item.addEventListener('mousedown', () => item.remove())

		item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
		expect(onPointerDownOutside).not.toHaveBeenCalled()
		panel.remove()
	})

	it('список открытых слоёв снизу вверх; размонтированный слой уходит из стека', async () => {
		const open = ref(false)
		const first = mountLayer({ isActive: () => true })
		mountLayer({ isActive: () => open.value })
		open.value = true
		await nextTick()

		expect(getOpenLayers()).toHaveLength(2)
		expect(getOpenLayers()[0].order).toBeLessThan(getOpenLayers()[1].order)

		first.unmount()
		expect(getOpenLayers()).toHaveLength(1)
	})
})

describe('useLayerIndex', () => {
	function mountIndexed(isActive: () => boolean, children: () => ReturnType<typeof h>[] = () => []) {
		let style!: ReturnType<typeof useLayerIndex>
		const component = defineComponent({
			setup() {
				style = useLayerIndex(isActive)
				return () => h('div', children())
			},
		})
		return { component, getIndex: () => style.value['--rise-layer-index'], getStyle: () => style.value }
	}

	it('слой, открытый позже, выше; закрытие нижнего сдвигает верхний вниз', async () => {
		const popoverOpen = ref(false)
		const modalOpen = ref(false)
		const modal = mountIndexed(() => modalOpen.value)
		const popover = mountIndexed(() => popoverOpen.value)
		render(modal.component)
		render(popover.component)

		// Поповер создан позже окна, но открыт раньше: окно, открытое из поповера, — над ним
		popoverOpen.value = true
		await nextTick()
		modalOpen.value = true
		await nextTick()
		expect(popover.getIndex()).toBe('1')
		expect(modal.getIndex()).toBe('2')

		popoverOpen.value = false
		await nextTick()
		expect(modal.getIndex()).toBe('1')
	})

	it('слои, открытые при монтировании, упорядочены как вложены: внешний ниже вложенного', () => {
		const inner = mountIndexed(() => true)
		const outer = mountIndexed(
			() => true,
			() => [h(inner.component)],
		)
		const { unmount } = render(outer.component)

		expect(outer.getIndex()).toBe('1')
		expect(inner.getIndex()).toBe('2')

		unmount()
		const alone = mountIndexed(() => true)
		render(alone.component)
		expect(alone.getIndex()).toBe('1')
	})

	it('объект стиля прежний, пока место слоя не меняется: открытие слоёв выше не перерисовывает нижний', async () => {
		const isUpperOpen = ref(false)
		const lower = mountIndexed(() => true)
		const upper = mountIndexed(() => isUpperOpen.value)
		render(lower.component)
		render(upper.component)
		const before = lower.getStyle()

		isUpperOpen.value = true
		await nextTick()
		expect(upper.getIndex()).toBe('2')
		expect(lower.getStyle()).toBe(before)
	})
})
