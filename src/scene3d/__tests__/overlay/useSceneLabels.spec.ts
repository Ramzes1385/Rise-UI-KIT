import { shallowRef } from 'vue'
import { OrthographicCamera, Vector3 } from 'three'
import { LABEL_ID_ATTR, useSceneLabels } from '../../overlay/useSceneLabels'
import type { Scene3DLabelItem } from '../../types/internal/scene3dInternal.types'

const SIZE = { width: 200, height: 100 }

function camera() {
	const view = new OrthographicCamera(-10, 10, 5, -5, 0.1, 100)
	view.position.set(0, 10, 0)
	view.up.set(0, 0, -1)
	view.lookAt(0, 0, 0)
	view.updateMatrixWorld()
	return view
}

const item = (id: string, x: number, priority = 1): Scene3DLabelItem => ({ id, anchor: new Vector3(x, 0, 0), priority })

function layerWith(...ids: string[]) {
	const layer = document.createElement('div')
	ids.forEach(id => {
		const element = document.createElement('span')
		element.setAttribute(LABEL_ID_ATTR, id)
		vi.spyOn(element, 'offsetWidth', 'get').mockReturnValue(40)
		vi.spyOn(element, 'offsetHeight', 'get').mockReturnValue(20)
		layer.append(element)
	})
	return layer
}

const labelOf = (layer: HTMLElement, id: string) => layer.querySelector<HTMLElement>(`[${LABEL_ID_ATTR}="${id}"]`) as HTMLElement

describe('useSceneLabels', () => {
	it('update пишет положение и видимость прямо в style', () => {
		const layer = layerWith('a', 'out')
		const labels = useSceneLabels(shallowRef(layer))
		labels.setItems([item('a', 0), item('out', 50)])
		labels.update(camera(), SIZE)
		expect(labelOf(layer, 'a').style.translate).toBe('100px 50px')
		expect(labelOf(layer, 'a').style.visibility).toBe('visible')
		expect(labelOf(layer, 'out').style.visibility).toBe('hidden')
		expect(labels.spots.get('a')?.x).toBeCloseTo(100)
		expect(labels.spots.get('a')?.y).toBeCloseTo(50)
		expect(labels.spots.get('a')?.isVisible).toBe(true)
	})

	it('перекрытие: менее важная скрыта', () => {
		const layer = layerWith('a', 'b')
		const labels = useSceneLabels(shallowRef(layer))
		labels.setItems([item('a', 0, 1), item('b', 0.1, 2)])
		labels.update(camera(), SIZE)
		expect(labelOf(layer, 'b').style.visibility).toBe('visible')
		expect(labelOf(layer, 'a').style.visibility).toBe('hidden')
	})

	it('камера и размер не менялись, данные тоже — пересчёта нет; markDirty, движение камеры и размер его вызывают', () => {
		const layer = layerWith('a')
		const labels = useSceneLabels(shallowRef(layer))
		const view = camera()
		labels.setItems([item('a', 0)])
		labels.update(view, SIZE)
		const element = labelOf(layer, 'a')
		element.style.translate = '5px 5px'
		labels.update(view, SIZE)
		expect(element.style.translate).toBe('5px 5px')
		labels.markDirty()
		labels.update(view, SIZE)
		expect(element.style.translate).toBe('100px 50px')
		element.style.translate = '5px 5px'
		view.position.x = 2
		labels.update(view, SIZE)
		expect(element.style.translate).not.toBe('5px 5px')
		element.style.translate = '5px 5px'
		labels.update(view, { width: 300, height: 100 })
		expect(element.style.translate).not.toBe('5px 5px')
	})

	it('setItems сбрасывает найденные элементы и требует пересчёта', () => {
		const layer = layerWith('a', 'b')
		const labels = useSceneLabels(shallowRef(layer))
		const view = camera()
		labels.setItems([item('a', 0)])
		labels.update(view, SIZE)
		expect(labelOf(layer, 'b').style.translate).toBe('')
		labels.setItems([item('a', 0), item('b', 5)])
		labels.update(view, SIZE)
		expect(labelOf(layer, 'b').style.translate).toBe('150px 50px')
	})

	it('элемент, который Vue дорисовал позже, находится при следующем пересчёте; чужие элементы слоя игнорируются', () => {
		const layer = layerWith('a', 'stranger')
		const labels = useSceneLabels(shallowRef(layer))
		const view = camera()
		labels.setItems([item('a', 0), item('late', 2)])
		labels.update(view, SIZE)
		expect(labelOf(layer, 'stranger').style.translate).toBe('')
		const late = layerWith('late').firstElementChild as HTMLElement
		layer.append(late)
		labels.markDirty()
		labels.update(view, SIZE)
		expect(late.style.translate).toBe('120px 50px')
	})

	it('слой ещё не смонтирован: положения считаются, писать некуда', () => {
		const labels = useSceneLabels(shallowRef<HTMLElement | null>(null))
		labels.setItems([item('a', 0)])
		labels.update(camera(), SIZE)
		expect(labels.spots.get('a')?.x).toBe(100)
	})

	it('dispose забывает подписи; после него update пересчитывает с нуля', () => {
		const layer = layerWith('a')
		const labels = useSceneLabels(shallowRef(layer))
		const view = camera()
		labels.setItems([item('a', 0)])
		labels.update(view, SIZE)
		labels.dispose()
		expect(labels.spots.size).toBe(0)
		labels.update(view, SIZE)
		expect(labels.spots.size).toBe(0)
		expect(labels.layer.value).toBe(layer)
	})
})
