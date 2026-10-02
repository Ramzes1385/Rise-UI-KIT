import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, screen } from '@testing-library/vue'
import type { ImageMapPolygon } from '@components/BaseImageMap/types/imageMapData.types'
import { lastModel, makeSvgMap, pressKey, renderEditor, statusOf } from '../utils/editorTestUtils'

function canvasOf(): HTMLElement {
	return screen.getByRole('application', { name: 'Холст карты' })
}

async function press(init: KeyboardEventInit): Promise<boolean> {
	const isNotPrevented = pressKey(canvasOf(), init)
	await nextTick()
	await nextTick()
	return isNotPrevented
}

function modelObject(emitted: () => Record<string, unknown[][]>, id: string) {
	return lastModel(emitted)?.objects.find(object => object.id === id)
}

describe('BaseImageMapEditor клавиатура: выбор', () => {
	it('стрелки сдвигают выделенное на nudgeStep, с Shift — вдесятеро, и объявляют положение', async () => {
		const { container, emitted } = renderEditor({ selected: 'r1' })
		expect(await press({ key: 'ArrowRight' })).toBe(false)
		expect(modelObject(emitted, 'r1')).toMatchObject({ x: 0.105, y: 0.1 })
		expect(statusOf(container)).toHaveTextContent('Слева 10,5 %, сверху 10 %')
		await press({ key: 'ArrowDown', shiftKey: true })
		expect(modelObject(emitted, 'r1')).toMatchObject({ x: 0.105, y: 0.15 })
		await press({ key: 'ArrowLeft' })
		await press({ key: 'ArrowUp' })
		expect(modelObject(emitted, 'r1')).toMatchObject({ x: 0.1, y: 0.145 })
	})

	it('сдвиги стрелками подряд — один шаг истории', async () => {
		const { emitted } = renderEditor({ selected: 'r1', nudgeStep: 0.1 })
		await press({ key: 'ArrowRight' })
		await press({ key: 'ArrowRight' })
		expect(modelObject(emitted, 'r1')).toMatchObject({ x: 0.3 })
		await fireEvent.click(screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' }))
		expect(modelObject(emitted, 'r1')).toMatchObject({ x: 0.1 })
		expect(screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' })).toBeDisabled()
	})

	it('стрелки без выделения и у svg-объекта ничего не меняют', async () => {
		const { emitted, rerender } = renderEditor()
		expect(await press({ key: 'ArrowRight' })).toBe(false)
		await rerender({ modelValue: makeSvgMap(), selected: 's1' })
		await press({ key: 'ArrowRight' })
		expect(emitted()['update:modelValue']).toBeUndefined()
	})

	it('Delete и Backspace удаляют выделенное и объявляют', async () => {
		const { container, emitted, rerender } = renderEditor({ selected: 'r1' })
		await press({ key: 'Delete' })
		expect(modelObject(emitted, 'r1')).toBeUndefined()
		expect(statusOf(container)).toHaveTextContent('Удалён объект «Зал»')
		expect(emitted()['update:selected']).toEqual([[null]])
		await rerender({ selected: 'p1' })
		await press({ key: 'Backspace' })
		expect(modelObject(emitted, 'p1')).toBeUndefined()
		expect(await press({ key: 'Delete' })).toBe(false)
	})

	it('Escape снимает выделение; без выделения и прочие клавиши не перехватываются', async () => {
		const { emitted } = renderEditor({ selected: 'r1' })
		expect(await press({ key: 'Escape' })).toBe(false)
		expect(emitted()['update:selected']).toEqual([[null]])
		expect(await press({ key: 'Escape' })).toBe(true)
		expect(await press({ key: 'a' })).toBe(true)
	})

	it('с Ctrl, Alt и ⌘ холст клавиши не берёт; isDisabled — тоже', async () => {
		const { emitted, rerender } = renderEditor({ selected: 'r1' })
		expect(await press({ key: 'ArrowRight', altKey: true })).toBe(true)
		expect(await press({ key: 'Delete', ctrlKey: true })).toBe(true)
		expect(await press({ key: 'Delete', metaKey: true })).toBe(true)
		await rerender({ isDisabled: true })
		expect(await press({ key: 'Delete' })).toBe(true)
		expect(emitted()['update:modelValue']).toBeUndefined()
	})
})

describe('BaseImageMapEditor клавиатура: рисование', () => {
	it('точка: стрелки ведут перекрестие, Enter ставит точку; blur прячет перекрестие', async () => {
		const { container, emitted } = renderEditor({ tool: 'point' })
		expect(container.querySelector('.base-image-map-editor__cursor')).toBeNull()
		await press({ key: 'ArrowRight' })
		const cursor = container.querySelector('.base-image-map-editor__cursor') as HTMLElement
		expect(cursor.style.left).toBe('50.5%')
		await press({ key: 'Enter' })
		expect(modelObject(emitted, 'point-1')).toMatchObject({ x: 0.505, y: 0.5, layer: 'l1' })
		expect(statusOf(container)).toHaveTextContent('Добавлен объект «Точка 2»')
		await fireEvent.blur(canvasOf())
		expect(container.querySelector('.base-image-map-editor__cursor')).toBeNull()
	})

	it('прямоугольник: Enter — первый угол, стрелки, Enter — второй угол', async () => {
		const { container, emitted } = renderEditor({ tool: 'rect', nudgeStep: 0.1 })
		await press({ key: 'Enter' })
		expect(statusOf(container)).toHaveTextContent(/Первый угол поставлен/)
		await press({ key: 'ArrowRight' })
		await press({ key: 'ArrowDown', shiftKey: true })
		expect(container.querySelector('.base-image-map-editor__draft')).not.toBeNull()
		await press({ key: 'Enter' })
		expect(modelObject(emitted, 'rect-1')).toMatchObject({ x: 0.5, y: 0.5, width: 0.1, height: 0.5 })
		expect(container.querySelector('.base-image-map-editor__draft')).toBeNull()
	})

	it('первый угол с клавиатуры сбрасывается при смене инструмента и слоя', async () => {
		const { container, emitted, rerender } = renderEditor({ tool: 'rect', nudgeStep: 0.1 })
		await press({ key: 'Enter' })
		await rerender({ tool: 'select' })
		await rerender({ tool: 'rect' })
		expect(container.querySelector('.base-image-map-editor__draft')).toBeNull()
		await press({ key: 'Enter' })
		expect(statusOf(container)).toHaveTextContent(/Первый угол поставлен/)
		expect(lastModel(emitted)).toBeUndefined()
		await fireEvent.click(screen.getByRole('button', { name: 'Второй' }))
		await press({ key: 'Enter' })
		expect(lastModel(emitted)).toBeUndefined()
		expect(statusOf(container)).toHaveTextContent(/Первый угол поставлен/)
	})

	it('эллипс: пробел ставит углы; перекрестие у края прижато', async () => {
		const { emitted } = renderEditor({ tool: 'ellipse', nudgeStep: 0.5 })
		await press({ key: ' ' })
		await press({ key: 'ArrowLeft', shiftKey: true })
		await press({ key: 'ArrowUp' })
		await press({ key: ' ' })
		expect(modelObject(emitted, 'ellipse-1')).toMatchObject({ x: 0.25, y: 0.25, rx: 0.25, ry: 0.25 })
	})

	it('многоугольник: Enter — вершина, Backspace убирает, Shift+Enter завершает', async () => {
		const { container, emitted } = renderEditor({ tool: 'polygon', nudgeStep: 0.1 })
		await press({ key: 'Enter' })
		expect(statusOf(container)).toHaveTextContent('Вершина 1')
		await press({ key: 'ArrowRight' })
		await press({ key: 'Enter' })
		await press({ key: 'ArrowDown' })
		await press({ key: 'Enter' })
		await press({ key: 'Backspace' })
		expect(container.querySelector('polyline')?.getAttribute('points')?.split(' ')).toHaveLength(3)
		await press({ key: 'Enter', shiftKey: true })
		expect(statusOf(container)).toHaveTextContent('Нужно не меньше трёх вершин')
		await press({ key: 'Enter' })
		await press({ key: 'Enter', shiftKey: true })
		expect((modelObject(emitted, 'polygon-1') as ImageMapPolygon).points).toEqual([
			[0.5, 0.5],
			[0.6, 0.5],
			[0.6, 0.6],
		])
	})

	it('Backspace вне многоугольника и прочие клавиши при рисовании не перехватываются', async () => {
		renderEditor({ tool: 'rect' })
		expect(await press({ key: 'Backspace' })).toBe(true)
		expect(await press({ key: 'x' })).toBe(true)
	})

	it('Escape отменяет рисование, затем возвращает инструмент «Выбор»', async () => {
		const { container, emitted } = renderEditor({ tool: 'rect' })
		await press({ key: 'Enter' })
		await press({ key: 'Escape' })
		expect(statusOf(container)).toHaveTextContent('Рисование отменено')
		expect(emitted()['update:tool']).toBeUndefined()
		await press({ key: 'Escape' })
		expect(emitted()['update:tool']).toEqual([['select']])
		expect(screen.getByRole('radio', { name: 'Выбор' })).toBeChecked()
	})

	it('Escape отменяет и начатый многоугольник', async () => {
		const { container } = renderEditor({ tool: 'polygon' })
		await press({ key: 'Enter' })
		await press({ key: 'Escape' })
		expect(statusOf(container)).toHaveTextContent('Рисование отменено')
		expect(container.querySelector('polyline')).toBeNull()
	})
})
