import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { OrthographicCamera } from 'three'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

const env = useFlowMap3DEnvironment()

const area = () => screen.getByRole('group', { name: 'Оформление заказа' })
const press = async (key: string, init: KeyboardEventInit = {}) => {
	await fireEvent.keyDown(area(), { key, ...init })
	await nextTick()
	env.flushFrames()
}
const announced = () => document.querySelector('.base-flow-map-3d__sr[role="status"]')?.textContent ?? ''

describe('BaseFlowMap3D: клавиатура', () => {
	it('стрелка выбирает узел, сообщает `focus-change` и озвучивает название', async () => {
		const onFocus = vi.fn()
		const { container } = await env.renderMap({ 'onFocus-change': onFocus })
		await press('ArrowRight')
		expect(onFocus).toHaveBeenCalledTimes(1)
		const { id } = onFocus.mock.calls[0][0]
		expect(container.querySelector(`[data-label-id="${id}"]`)).toHaveClass('base-flow-map-3d__tag--focused')
		await waitFor(() => expect(announced()).not.toBe(''))
		await press('ArrowRight')
		await press('ArrowDown')
		await press('ArrowLeft')
		await press('ArrowUp')
		expect(onFocus.mock.calls.length).toBeGreaterThan(1)
	})

	it('Home и End идут к первому и последнему узлу в порядке чтения', async () => {
		const onFocus = vi.fn()
		await env.renderMap({ 'onFocus-change': onFocus })
		await press('Home')
		await press('End')
		expect(onFocus).toHaveBeenCalledTimes(2)
		expect(onFocus.mock.calls[0][0].id).not.toBe(onFocus.mock.calls[1][0].id)
	})

	it('буквы ищут узел по названию, пауза сбрасывает набор', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const onFocus = vi.fn()
		await env.renderMap({ 'onFocus-change': onFocus })
		await press('к')
		expect(onFocus).toHaveBeenLastCalledWith({ entity: 'node', id: 'cache' })
		vi.advanceTimersByTime(800)
		await press('о')
		expect(onFocus).toHaveBeenLastCalledWith({ entity: 'node', id: 'queue' })
		vi.useRealTimers()
	})

	it('квадратные скобки идут по связям вперёд и назад', async () => {
		const onFocus = vi.fn()
		await env.renderMap({ 'onFocus-change': onFocus })
		await press('ш')
		expect(onFocus).toHaveBeenLastCalledWith({ entity: 'node', id: 'api' })
		await press(']')
		expect(onFocus).toHaveBeenLastCalledWith({ entity: 'node', id: 'queue' })
		await press('[')
		expect(onFocus).toHaveBeenLastCalledWith({ entity: 'node', id: 'api' })
		await press('[')
		expect(onFocus).toHaveBeenLastCalledWith({ entity: 'node', id: 'api' })
	})

	it('скобки без фокуса ничего не выбирают', async () => {
		const onFocus = vi.fn()
		await env.renderMap({ 'onFocus-change': onFocus })
		await press(']')
		await press('[')
		expect(onFocus).not.toHaveBeenCalled()
	})

	it('Enter и пробел выбирают узел в фокусе, Escape снимает выбор', async () => {
		const onSelection = vi.fn()
		const { container } = await env.renderMap({ 'onUpdate:selection': onSelection })
		await press('Enter')
		expect(onSelection).not.toHaveBeenCalled()
		await press('ш')
		await press('Enter')
		expect(onSelection).toHaveBeenLastCalledWith(['api'])
		expect(container.querySelector('[data-label-id="api"]')).toHaveClass('base-flow-map-3d__tag--selected')
		await press('Escape')
		expect(onSelection).toHaveBeenLastCalledWith([])
		await press(' ')
		expect(onSelection).toHaveBeenLastCalledWith(['api'])
	})

	it('Shift и буква начинают поиск; пока набор идёт, Q, E и скобки — буквы, а не команды', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const onFocus = vi.fn()
		const { camera } = await env.renderMap({ 'onFocus-change': onFocus })
		const start = camera().position.clone()
		await press('Ш', { shiftKey: true })
		expect(onFocus).toHaveBeenLastCalledWith({ entity: 'node', id: 'api' })
		await press('q')
		expect(camera().position.distanceTo(start)).toBeLessThan(0.001)
		await press(']')
		expect(onFocus).toHaveBeenLastCalledWith({ entity: 'node', id: 'queue' })
		vi.advanceTimersByTime(800)
		await press('q')
		expect(camera().position.distanceTo(start)).toBeGreaterThan(0.1)
		vi.useRealTimers()
	})

	it('клавиши-модификаторы набор не сбрасывают, прочие служебные — сбрасывают', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const onFocus = vi.fn()
		await env.renderMap({ 'onFocus-change': onFocus })
		await press('к')
		await press('Shift')
		await press('е')
		expect(onFocus).toHaveBeenLastCalledWith({ entity: 'node', id: 'cache' })
		await press('F2')
		onFocus.mockClear()
		await press('л')
		expect(onFocus).not.toHaveBeenCalled()
		vi.useRealTimers()
	})

	it('Shift и стрелки поворачивают и наклоняют камеру, плюс, минус и 0 — масштаб и сброс', async () => {
		const { camera } = await env.renderMap()
		const position = () => camera().position.clone()
		const zoomOf = () => (camera() as OrthographicCamera).zoom
		const start = position()
		await press('ArrowLeft', { shiftKey: true })
		await nextTick()
		env.flushFrames()
		expect(position().distanceTo(start)).toBeGreaterThan(0)
		await press('ArrowDown', { shiftKey: true })
		const zoom = zoomOf()
		await press('+')
		expect(zoomOf()).toBeGreaterThan(zoom)
		await press('-')
		await press('0')
		expect(zoomOf()).toBeCloseTo(zoom, 3)
	})

	it('Q и E поворачивают на четверть оборота', async () => {
		const { camera } = await env.renderMap()
		const start = camera().position.clone()
		await press('q')
		expect(camera().position.distanceTo(start)).toBeGreaterThan(0.1)
	})

	it('сочетания с Ctrl, Alt и Meta не считаются клавишами управления; события потомков игнорируются', async () => {
		const onFocus = vi.fn()
		await env.renderMap({ 'onFocus-change': onFocus })
		await press('Home', { ctrlKey: true })
		await press('Home', { altKey: true })
		await press('a', { ctrlKey: true })
		await fireEvent.keyDown(document.querySelector('canvas') as HTMLCanvasElement, { key: 'Home' })
		expect(onFocus).not.toHaveBeenCalled()
	})

	it('потеря фокуса области снимает фокус с узла', async () => {
		const { container } = await env.renderMap()
		await press('ш')
		expect(container.querySelector('[data-label-id="api"]')).toHaveClass('base-flow-map-3d__tag--focused')
		await fireEvent.focusOut(area())
		await nextTick()
		expect(container.querySelector('[data-label-id="api"]')).not.toHaveClass('base-flow-map-3d__tag--focused')
	})

	it('скрытый список: выбор узла кнопкой выбирает, фокусирует и наезжает камерой', async () => {
		const onSelection = vi.fn()
		const onFocus = vi.fn()
		const { camera } = await env.renderMap({ 'onUpdate:selection': onSelection, 'onFocus-change': onFocus })
		const zoom = (camera() as OrthographicCamera).zoom
		await fireEvent.click(screen.getByRole('button', { name: /Кеш/ }))
		env.flushFrames()
		expect(onSelection).toHaveBeenLastCalledWith(['cache'])
		expect(onFocus).toHaveBeenLastCalledWith({ entity: 'node', id: 'cache' })
		expect((camera() as OrthographicCamera).zoom).toBeGreaterThanOrEqual(zoom)
	})

	it('в списке есть группы и раздел «Без группы»', async () => {
		await env.renderMap()
		expect(screen.getByRole('list', { name: 'Бэкенд' })).toBeInTheDocument()
		expect(screen.getByRole('list', { name: 'Данные' })).toBeInTheDocument()
		expect(screen.getByRole('list', { name: 'Без группы' })).toBeInTheDocument()
	})
})
