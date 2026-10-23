import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, screen } from '@testing-library/vue'
import { useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

const env = useFlowMap3DEnvironment()

const area = () => screen.getByRole('group', { name: 'Оформление заказа' })
const tag = (container: Element, id: string) => container.querySelector(`[data-label-id="${id}"]`) as HTMLElement

describe('BaseFlowMap3D: указатель', () => {
	it('щелчок по бирке выбирает узел и сообщает `node-click`', async () => {
		const onClick = vi.fn()
		const onSelection = vi.fn()
		const { container } = await env.renderMap({ onNodeClick: onClick, 'onUpdate:selection': onSelection })
		await fireEvent.pointerDown(tag(container, 'queue'), { clientX: 10, clientY: 10 })
		await fireEvent.click(tag(container, 'queue'), { clientX: 10, clientY: 10 })
		expect(onSelection).toHaveBeenLastCalledWith(['queue'])
		expect(onClick).toHaveBeenCalled()
	})

	it('перетаскивание не снимает выбор, а щелчок по пустому месту снимает', async () => {
		const onSelection = vi.fn()
		const { container } = await env.renderMap({ 'onUpdate:selection': onSelection })
		await fireEvent.click(tag(container, 'queue'))
		onSelection.mockClear()
		await fireEvent.pointerDown(area(), { clientX: 10, clientY: 10 })
		await fireEvent.click(area(), { clientX: 200, clientY: 200 })
		expect(onSelection).not.toHaveBeenCalled()
		await fireEvent.pointerDown(area(), { clientX: 10, clientY: 10 })
		await fireEvent.click(area(), { clientX: 11, clientY: 11 })
		expect(onSelection).toHaveBeenLastCalledWith([])
	})

	it('щелчок без нажатия до него (клавиатура) тоже снимает выбор', async () => {
		const onSelection = vi.fn()
		const { container } = await env.renderMap({ 'onUpdate:selection': onSelection })
		await fireEvent.click(tag(container, 'queue'))
		await fireEvent.click(area())
		expect(onSelection).toHaveBeenLastCalledWith([])
	})

	it('клики по колонке масштаба и легенде не снимают выбор', async () => {
		const onSelection = vi.fn()
		const { container } = await env.renderMap({ 'onUpdate:selection': onSelection })
		await fireEvent.click(tag(container, 'queue'))
		onSelection.mockClear()
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		await fireEvent.pointerDown(screen.getByRole('group', { name: 'Масштаб' }))
		await vi.waitFor(() => expect(container.querySelector('.base-flow-map__legend')).toBeInTheDocument())
		await fireEvent.click(container.querySelector('.base-flow-map__legend') as HTMLElement)
		await fireEvent.pointerDown(container.querySelector('.base-flow-map__legend') as HTMLElement)
		expect(onSelection).not.toHaveBeenCalled()
	})

	it('двойной щелчок и контекстное меню по бирке сообщают события', async () => {
		const onDouble = vi.fn()
		const onMenu = vi.fn()
		const { container } = await env.renderMap({ onNodeDblclick: onDouble, onNodeContextmenu: onMenu })
		await fireEvent.dblClick(tag(container, 'db'))
		expect(onDouble).toHaveBeenCalled()
		const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
		tag(container, 'db').dispatchEvent(menu)
		expect(menu.defaultPrevented).toBe(true)
		expect(onMenu).toHaveBeenCalled()
		await fireEvent.dblClick(area())
		await fireEvent.contextMenu(area())
		expect(onDouble).toHaveBeenCalledTimes(1)
		expect(onMenu).toHaveBeenCalledTimes(1)
	})

	it('наведение на бирку подсвечивает узел, уход указателя снимает подсветку', async () => {
		const onEnter = vi.fn()
		const onLeave = vi.fn()
		const { container } = await env.renderMap({ onNodeEnter: onEnter, onNodeLeave: onLeave })
		await fireEvent.pointerMove(tag(container, 'api'), { pointerType: 'mouse' })
		env.flushFrames()
		await nextTick()
		expect(onEnter).toHaveBeenCalled()
		expect(tag(container, 'api')).toHaveClass('base-flow-map-3d__tag--hover')
		await fireEvent.pointerLeave(area())
		await nextTick()
		expect(onLeave).toHaveBeenCalled()
	})

	it('касание не наводит, а щипок двумя пальцами меняет масштаб', async () => {
		const { camera } = await env.renderMap()
		const zoom = (camera() as unknown as { zoom: number }).zoom
		await fireEvent.pointerMove(area(), { pointerType: 'touch' })
		await fireEvent.pointerDown(area(), { pointerType: 'touch', pointerId: 1, clientX: 100, clientY: 100 })
		await fireEvent.pointerDown(area(), { pointerType: 'touch', pointerId: 2, clientX: 200, clientY: 100 })
		await fireEvent.pointerMove(area(), { pointerType: 'touch', pointerId: 2, clientX: 300, clientY: 100 })
		env.flushFrames()
		expect((camera() as unknown as { zoom: number }).zoom).toBeGreaterThan(zoom)
		await fireEvent.pointerUp(area(), { pointerType: 'touch', pointerId: 2 })
		await fireEvent.pointerCancel(area(), { pointerType: 'touch', pointerId: 1 })
	})

	it('выключенная карта не выбирает узлы', async () => {
		const onSelection = vi.fn()
		const { container } = await env.renderMap({ isDisabled: true, 'onUpdate:selection': onSelection })
		await fireEvent.click(tag(container, 'queue'))
		expect(onSelection).not.toHaveBeenCalled()
	})
})
