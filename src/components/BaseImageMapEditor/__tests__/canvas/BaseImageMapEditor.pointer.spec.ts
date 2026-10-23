import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, screen } from '@testing-library/vue'
import { at, drag, lastModel, makeSvgMap, objectEl, renderEditor, statusOf } from '../utils/editorTestUtils'
import type { ImageMapEllipse, ImageMapPolygon, ImageMapRect } from '@components/BaseImageMap/types/imageMapData.types'

function modelObject<T>(emitted: () => Record<string, unknown[][]>, id: string): T {
	return lastModel(emitted).objects.find(object => object.id === id) as T
}

describe('BaseImageMapEditor холст: выбор мышью', () => {
	it('щелчок по объекту выделяет его, по пустому месту — снимает выделение', async () => {
		const { container, stage, emitted } = renderEditor()
		await fireEvent.pointerDown(objectEl(container, 'r1'), at(0.2, 0.2))
		await fireEvent.pointerUp(stage(), at(0.2, 0.2))
		expect(emitted()['update:selected']).toEqual([['r1']])
		expect(screen.getByRole('button', { name: /Зал/ })).toHaveAttribute('aria-current', 'true')
		expect(objectEl(container, 'r1')).toHaveClass('base-image-map-editor__shape--selected')
		expect(container.querySelectorAll('[data-editor-handle]')).toHaveLength(4)
		await fireEvent.pointerDown(stage(), at(0.9, 0.1))
		await fireEvent.pointerUp(stage(), at(0.9, 0.1))
		expect(emitted()['update:selected']).toEqual([['r1'], [null]])
		expect(emitted()['update:modelValue']).toBeUndefined()
	})

	it('протяжка двигает объект одним шагом истории', async () => {
		const { container, stage, emitted } = renderEditor()
		await fireEvent.pointerDown(objectEl(container, 'r1'), at(0.2, 0.2))
		expect(stage()).toHaveClass('base-image-map-editor__stage--dragging')
		await fireEvent.pointerMove(stage(), at(0.25, 0.22))
		await fireEvent.pointerMove(stage(), at(0.3, 0.25))
		await fireEvent.pointerUp(stage(), at(0.3, 0.25))
		expect(modelObject<ImageMapRect>(emitted, 'r1')).toMatchObject({ x: 0.2, y: 0.15, width: 0.2, height: 0.2 })
		expect(emitted()['update:modelValue']).toHaveLength(1)
		await fireEvent.click(screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' }))
		expect(modelObject<ImageMapRect>(emitted, 'r1')).toMatchObject({ x: 0.1, y: 0.1 })
		expect(screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' })).toHaveAttribute('aria-disabled', 'true')
	})

	it('объект не уходит за край картинки', async () => {
		const { container, stage, emitted } = renderEditor()
		await drag(stage(), { target: objectEl(container, 'r1'), from: [0.2, 0.2], to: [0, 0] })
		expect(modelObject<ImageMapRect>(emitted, 'r1')).toMatchObject({ x: 0, y: 0 })
		await drag(stage(), { target: objectEl(container, 'pg'), from: [0.7, 0.7], to: [1, 1] })
		expect(modelObject<ImageMapPolygon>(emitted, 'pg').points).toEqual([
			[0.8, 0.8],
			[1, 0.8],
			[0.9, 1],
		])
	})

	it('щелчок без сдвига не пишет шаг истории', async () => {
		const { container, stage, emitted } = renderEditor()
		await fireEvent.pointerDown(objectEl(container, 'p1'), at(0.5, 0.5))
		await fireEvent.pointerUp(stage(), at(0.5, 0.5))
		expect(emitted()['update:selected']).toEqual([['p1']])
		expect(emitted()['update:modelValue']).toBeUndefined()
	})

	it('угловая ручка меняет размер, противоположный угол закреплён', async () => {
		const { container, stage, emitted } = renderEditor({ selected: 'r1' })
		const handle = container.querySelector('[data-editor-handle="2"]') as HTMLElement
		expect(Number.parseFloat(handle.style.left)).toBeCloseTo(30)
		await drag(stage(), { target: handle, from: [0.3, 0.3], to: [0.5, 0.4] })
		expect(modelObject<ImageMapRect>(emitted, 'r1')).toMatchObject({ x: 0.1, y: 0.1, width: 0.4, height: 0.3 })
		await drag(stage(), {
			target: container.querySelector('[data-editor-handle="0"]') as HTMLElement,
			from: [0.1, 0.1],
			to: [0.9, 0.9],
		})
		expect(modelObject<ImageMapRect>(emitted, 'r1')).toMatchObject({ x: 0.5, y: 0.4, width: 0.4, height: 0.5 })
	})

	it('ручки эллипса и вершины многоугольника', async () => {
		const { container, stage, emitted, rerender } = renderEditor({ selected: 'e1', layer: 'l2' })
		await drag(stage(), {
			target: container.querySelector('[data-editor-handle="2"]') as HTMLElement,
			from: [0.45, 0.75],
			to: [0.55, 0.85],
		})
		expect(modelObject<ImageMapEllipse>(emitted, 'e1')).toMatchObject({ x: 0.45, y: 0.75, rx: 0.1, ry: 0.1 })
		await rerender({ selected: 'pg', layer: 'l1' })
		expect(container.querySelectorAll('[data-editor-handle]')).toHaveLength(3)
		await drag(stage(), {
			target: container.querySelector('[data-editor-handle="1"]') as HTMLElement,
			from: [0.8, 0.6],
			to: [1.2, 0.5],
		})
		expect(modelObject<ImageMapPolygon>(emitted, 'pg').points[1]).toEqual([1, 0.5])
	})

	it('у точки ручек нет; объект другого слоя ручек не показывает', async () => {
		const { container, rerender } = renderEditor({ selected: 'p1' })
		expect(container.querySelectorAll('[data-editor-handle]')).toHaveLength(0)
		await rerender({ selected: 'e1' })
		await rerender({ layer: 'l1' })
		expect(container.querySelectorAll('[data-editor-handle]')).toHaveLength(0)
	})

	it('правая кнопка и isDisabled не трогают холст', async () => {
		const { container, emitted, rerender } = renderEditor()
		await fireEvent.pointerDown(objectEl(container, 'r1'), { ...at(0.2, 0.2), button: 2 })
		expect(emitted()['update:selected']).toBeUndefined()
		await rerender({ isDisabled: true })
		await fireEvent.pointerDown(objectEl(container, 'r1'), at(0.2, 0.2))
		expect(emitted()['update:selected']).toBeUndefined()
	})

	it('pointercancel при переносе возвращает объект на место без шага истории; движение без протяжки ничего не меняет', async () => {
		const { container, stage, emitted } = renderEditor()
		await fireEvent.pointerMove(stage(), at(0.4, 0.4))
		await fireEvent.pointerUp(stage(), at(0.4, 0.4))
		expect(emitted()['update:modelValue']).toBeUndefined()
		const before = objectEl(container, 'r1').getAttribute('x')
		await fireEvent.pointerDown(objectEl(container, 'r1'), at(0.2, 0.2))
		await fireEvent.pointerMove(stage(), at(0.3, 0.3))
		expect(objectEl(container, 'r1').getAttribute('x')).not.toBe(before)
		await fireEvent.pointerCancel(stage(), at(0.3, 0.3))
		expect(stage()).not.toHaveClass('base-image-map-editor__stage--dragging')
		expect(objectEl(container, 'r1').getAttribute('x')).toBe(before)
		expect(emitted()['update:modelValue']).toBeUndefined()
		expect(screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' })).toHaveAttribute('aria-disabled', 'true')
	})

	it('pointercancel при протяжке ручки возвращает размер; следующая протяжка — обычный шаг', async () => {
		const { container, stage, emitted } = renderEditor({ selected: 'r1' })
		const handle = (): HTMLElement => container.querySelector('[data-editor-handle="2"]') as HTMLElement
		const width = objectEl(container, 'r1').getAttribute('width')
		await fireEvent.pointerDown(handle(), at(0.3, 0.3))
		await fireEvent.pointerMove(stage(), at(0.5, 0.4))
		expect(objectEl(container, 'r1').getAttribute('width')).not.toBe(width)
		await fireEvent.pointerCancel(stage(), at(0.5, 0.4))
		expect(objectEl(container, 'r1').getAttribute('width')).toBe(width)
		expect(emitted()['update:modelValue']).toBeUndefined()
		await drag(stage(), { target: handle(), from: [0.3, 0.3], to: [0.5, 0.4] })
		expect(emitted()['update:modelValue']).toHaveLength(1)
	})

	it('pointercancel во время рисования фигуру не создаёт', async () => {
		const { stage, emitted } = renderEditor({ tool: 'rect' })
		await fireEvent.pointerDown(stage(), at(0.2, 0.2))
		await fireEvent.pointerMove(stage(), at(0.4, 0.4))
		await fireEvent.pointerCancel(stage(), at(0.4, 0.4))
		expect(emitted()['update:modelValue']).toBeUndefined()
		expect(stage()).not.toHaveClass('base-image-map-editor__stage--dragging')
		await fireEvent.pointerCancel(stage(), at(0.4, 0.4))
		expect(emitted()['update:modelValue']).toBeUndefined()
	})

	it('без размеров холста точка — левый верхний угол', async () => {
		const { container, emitted, rerender } = renderEditor()
		await rerender({ tool: 'point' })
		const stage = container.querySelector('.base-image-map-editor__stage') as HTMLElement
		stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 0, height: 0 }) as DOMRect
		await fireEvent.pointerDown(stage, at(0.5, 0.5))
		await fireEvent.pointerUp(stage, at(0.5, 0.5))
		expect(modelObject(emitted, 'point-1')).toMatchObject({ x: 0, y: 0 })
	})

	it('svg-объект выделяется щелчком, но не двигается; выделенный получает класс', async () => {
		const { container, stage, emitted } = renderEditor({ modelValue: makeSvgMap() })
		await nextTick()
		const element = objectEl(container, 's1')
		expect(element.tagName.toLowerCase()).toBe('circle')
		expect(element).toHaveClass('base-image-map-editor__svg-object')
		await drag(stage(), { target: element, from: [0.5, 0.5], to: [0.6, 0.6] })
		await nextTick()
		expect(emitted()['update:selected']).toEqual([['s1']])
		expect(emitted()['update:modelValue']).toBeUndefined()
		expect(objectEl(container, 's1')).toHaveClass('base-image-map-editor__svg-object--selected')
		expect(container.querySelectorAll('[data-editor-handle]')).toHaveLength(0)
	})

	it('svg-объект без элемента в SVG остаётся в списке, на холсте не размечается', async () => {
		const map = makeSvgMap()
		map.objects.push({ type: 'svg', id: 'lost', title: 'Пропавший', elementId: 'missing' })
		const { container } = renderEditor({ modelValue: map })
		await nextTick()
		expect(screen.getByRole('button', { name: /Пропавший/ })).toBeInTheDocument()
		expect(container.querySelectorAll('.base-image-map-editor__svg-object')).toHaveLength(1)
	})
})

describe('BaseImageMapEditor холст: рисование мышью', () => {
	it('точка — в месте щелчка, на текущем слое, выделена и объявлена', async () => {
		const { container, stage, emitted } = renderEditor({ tool: 'point' })
		await fireEvent.pointerDown(stage(), at(0.25, 0.5))
		await fireEvent.pointerUp(stage(), at(0.25, 0.5))
		await nextTick()
		expect(modelObject(emitted, 'point-1')).toEqual({ type: 'point', id: 'point-1', title: 'Точка 2', layer: 'l1', x: 0.25, y: 0.5 })
		expect(emitted()['update:selected']).toEqual([['point-1']])
		expect(statusOf(container)).toHaveTextContent('Добавлен объект «Точка 2»')
		expect(screen.getByRole('button', { name: /Точка 2/ })).toHaveAttribute('aria-current', 'true')
	})

	it('прямоугольник — протяжкой от угла до угла с черновиком', async () => {
		const { container, stage, emitted } = renderEditor({ tool: 'rect' })
		await fireEvent.pointerDown(stage(), at(0.6, 0.5))
		await fireEvent.pointerMove(stage(), at(0.3, 0.1))
		expect(container.querySelector('.base-image-map-editor__draft')).not.toBeNull()
		await fireEvent.pointerUp(stage(), at(0.3, 0.1))
		expect(container.querySelector('.base-image-map-editor__draft')).toBeNull()
		expect(modelObject(emitted, 'rect-1')).toMatchObject({
			type: 'rect',
			title: 'Прямоугольник 2',
			x: 0.3,
			y: 0.1,
			width: 0.3,
			height: 0.4,
		})
	})

	it('щелчок без протяжки — фигура 10 %×10 % с центром в точке, у края прижата', async () => {
		const { stage, emitted } = renderEditor({ tool: 'rect' })
		await fireEvent.pointerDown(stage(), at(0.5, 0.5))
		await fireEvent.pointerUp(stage(), at(0.5, 0.5))
		expect(modelObject(emitted, 'rect-1')).toMatchObject({ x: 0.45, y: 0.45, width: 0.1, height: 0.1 })
		await fireEvent.pointerDown(stage(), at(0.99, 0.01))
		await fireEvent.pointerUp(stage(), at(0.99, 0.01))
		expect(modelObject(emitted, 'rect-2')).toMatchObject({ x: 0.9, y: 0, width: 0.1, height: 0.1 })
	})

	it('эллипс — центр и радиусы по рамке протяжки', async () => {
		const { stage, emitted } = renderEditor({ tool: 'ellipse' })
		await drag(stage(), { from: [0.2, 0.2], to: [0.6, 0.4] })
		expect(modelObject(emitted, 'ellipse-1')).toMatchObject({ type: 'ellipse', title: 'Эллипс 2', x: 0.4, y: 0.3, rx: 0.2, ry: 0.1 })
	})

	it('многоугольник: вершины щелчками, завершение щелчком по первой', async () => {
		const { container, stage, emitted } = renderEditor({ tool: 'polygon' })
		await fireEvent.pointerDown(stage(), at(0.1, 0.1))
		await fireEvent.pointerMove(stage(), at(0.3, 0.1))
		expect(container.querySelector('polyline')).toHaveAttribute('points', '100,50 300,50')
		await fireEvent.pointerDown(stage(), at(0.3, 0.1))
		await fireEvent.pointerDown(stage(), at(0.305, 0.1))
		expect(screen.queryByRole('button', { name: 'Завершить фигуру' })).toBeNull()
		await fireEvent.pointerDown(stage(), at(0.2, 0.3))
		await nextTick()
		expect(statusOf(container)).toHaveTextContent('Вершина 3')
		expect(screen.getByRole('button', { name: 'Завершить фигуру' })).toBeInTheDocument()
		await fireEvent.pointerLeave(stage())
		expect(container.querySelector('polyline')).toHaveAttribute('points', '100,50 300,50 200,150 500,250')
		await fireEvent.pointerDown(stage(), at(0.105, 0.1))
		expect(modelObject<ImageMapPolygon>(emitted, 'polygon-1')).toMatchObject({
			title: 'Многоугольник 2',
			points: [
				[0.1, 0.1],
				[0.3, 0.1],
				[0.2, 0.3],
			],
		})
		expect(container.querySelector('polyline')).toBeNull()
	})

	it('многоугольник: двойной щелчок и кнопка «Завершить фигуру»; меньше трёх вершин — объявление', async () => {
		const { container, stage, emitted } = renderEditor({ tool: 'polygon' })
		await fireEvent.pointerDown(stage(), at(0.1, 0.1))
		await fireEvent.dblClick(stage())
		await nextTick()
		expect(statusOf(container)).toHaveTextContent('Нужно не меньше трёх вершин')
		await fireEvent.pointerDown(stage(), at(0.5, 0.1))
		await fireEvent.pointerDown(stage(), at(0.5, 0.5))
		await fireEvent.dblClick(stage())
		expect(modelObject(emitted, 'polygon-1')).toBeDefined()
		await fireEvent.pointerDown(stage(), at(0.6, 0.6))
		await fireEvent.pointerDown(stage(), at(0.9, 0.6))
		await fireEvent.pointerDown(stage(), at(0.8, 0.9))
		await fireEvent.click(screen.getByRole('button', { name: 'Завершить фигуру' }))
		expect(modelObject(emitted, 'polygon-2')).toBeDefined()
	})

	it('двойной щелчок вне многоугольника ничего не делает; смена инструмента сбрасывает черновик', async () => {
		const { container, stage, emitted, rerender } = renderEditor({ tool: 'rect' })
		await fireEvent.dblClick(stage())
		expect(emitted()['update:modelValue']).toBeUndefined()
		await rerender({ tool: 'polygon' })
		await fireEvent.pointerDown(stage(), at(0.1, 0.1))
		expect(container.querySelector('polyline')).not.toBeNull()
		await fireEvent.click(screen.getByRole('radio', { name: 'Выбор' }))
		expect(container.querySelector('polyline')).toBeNull()
	})

	it('точка показывает значок своей группы и свой размер', () => {
		const { container } = renderEditor()
		const point = container.querySelector('.base-image-map-editor__point') as HTMLElement
		expect(point.style.left).toBe('50%')
		expect(point.style.getPropertyValue('--im-point-size')).toBe('28px')
		expect(point.querySelector('.base-icon, svg')).not.toBeNull()
	})
})
