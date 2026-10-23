import { BoxGeometry, Group, Mesh } from 'three'
import type { Model3DInstance } from '../../../types/model3d.types'
import { createModelThumbnails } from '../../../models/modelThumbnails'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Model3DThumbnailRenderer } from '../../../types/internal/model3dInternal.types'

// eslint-disable-next-line max-params
const rect = (left: number, top: number, width: number, height: number) =>
	({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect

function cellAt(box: DOMRect): HTMLElement {
	const cell = document.createElement('div')
	cell.getBoundingClientRect = () => box
	return cell
}

function fakeRenderer() {
	const calls: string[] = []
	const renderer = {
		domElement: document.createElement('canvas'),
		setPixelRatio: vi.fn(),
		setSize: vi.fn(),
		render: vi.fn((_scene: unknown, _camera: unknown) => calls.push('render')),
		dispose: vi.fn(),
		forceContextLoss: vi.fn(),
		setViewport: vi.fn(),
		setScissor: vi.fn(),
		setScissorTest: vi.fn(),
	}
	return { renderer: renderer as unknown as Model3DThumbnailRenderer, spies: renderer }
}

function instance(animations: Model3DInstance['animations'] = {}): Model3DInstance {
	const object = new Group()
	object.add(new Mesh(new BoxGeometry(1, 1, 1)))
	return { object, animations }
}

let queue: Array<(now: number) => void> = []
let cancel: ReturnType<typeof vi.fn>

beforeEach(() => {
	queue = []
	cancel = vi.fn()
	vi.stubGlobal('requestAnimationFrame', (callback: (now: number) => void) => queue.push(callback))
	vi.stubGlobal('cancelAnimationFrame', cancel)
})

afterEach(() => vi.unstubAllGlobals())

const flushFrame = (now: number) => {
	const pending = queue
	queue = []
	pending.forEach(callback => callback(now))
}

function setup(extra: { isReducedMotion?: () => boolean; getDuration?: () => number } = {}) {
	const canvas = document.createElement('canvas')
	canvas.getBoundingClientRect = () => rect(0, 0, 300, 200)
	const { renderer, spies } = fakeRenderer()
	const thumbs = createModelThumbnails({ canvas, createRenderer: () => renderer, ...extra })
	return { thumbs, spies, canvas }
}

describe('рисование ячеек', () => {
	it('add планирует один кадр; кадр рисует каждую видимую ячейку по ножницам', () => {
		const { thumbs, spies } = setup()
		thumbs.add('a', cellAt(rect(10, 20, 100, 80)), instance())
		thumbs.add('b', cellAt(rect(150, 100, 120, 60)), instance())
		expect(queue).toHaveLength(1)
		flushFrame(0)
		expect(spies.setSize).toHaveBeenCalledWith(300, 200, false)
		expect(spies.setScissorTest).toHaveBeenCalledWith(true)
		expect(spies.setViewport).toHaveBeenNthCalledWith(1, 10, 100, 100, 80)
		expect(spies.setScissor).toHaveBeenNthCalledWith(1, 10, 100, 100, 80)
		expect(spies.setViewport).toHaveBeenNthCalledWith(2, 150, 40, 120, 60)
		expect(spies.render).toHaveBeenCalledTimes(2)
		expect(queue).toHaveLength(0)
	})

	it('камера ортографическая, смотрит на модель с учётом пропорций ячейки', () => {
		const { thumbs, spies } = setup()
		thumbs.add('a', cellAt(rect(0, 0, 200, 100)), instance())
		flushFrame(0)
		const camera = spies.render.mock.calls[0][1] as unknown as { left: number; right: number; top: number; bottom: number }
		expect(camera.right).toBeCloseTo(-camera.left)
		expect(camera.right / camera.top).toBeCloseTo(2)
	})

	it('ячейка вне холста или нулевого размера пропускается', () => {
		const { thumbs, spies } = setup()
		thumbs.add('above', cellAt(rect(0, -200, 50, 50)), instance())
		thumbs.add('below', cellAt(rect(0, 400, 50, 50)), instance())
		thumbs.add('flat', cellAt(rect(0, 10, 0, 50)), instance())
		thumbs.add('low', cellAt(rect(0, 10, 50, 0)), instance())
		thumbs.add('in', cellAt(rect(0, 10, 50, 50)), instance())
		flushFrame(0)
		expect(spies.render).toHaveBeenCalledTimes(1)
	})

	it('в кадре видна только рисуемая модель', () => {
		const { thumbs, spies } = setup()
		const visibility: boolean[][] = []
		const first = instance()
		const second = instance()
		spies.render.mockImplementation(() => visibility.push([first.object.parent!.visible, second.object.parent!.visible]))
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), first)
		thumbs.add('b', cellAt(rect(100, 0, 50, 50)), second)
		flushFrame(0)
		expect(visibility).toEqual([
			[true, false],
			[false, true],
		])
	})

	it('повторный add с тем же id заменяет модель', () => {
		const { thumbs, spies } = setup()
		const first = instance()
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), first)
		const holder = first.object.parent!
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), instance())
		expect(holder.parent).toBeNull()
		flushFrame(0)
		expect(spies.render).toHaveBeenCalledTimes(1)
	})

	it('remove убирает ячейку и планирует перерисовку; неизвестный id не мешает', () => {
		const { thumbs, spies } = setup()
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), instance())
		flushFrame(0)
		thumbs.remove('a')
		thumbs.remove('ghost')
		expect(queue).toHaveLength(1)
		flushFrame(1)
		expect(spies.render).toHaveBeenCalledTimes(1)
	})

	it('invalidate перерисовывает, кадры не множатся', () => {
		const { thumbs, spies } = setup()
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), instance())
		flushFrame(0)
		thumbs.invalidate()
		thumbs.invalidate()
		expect(queue).toHaveLength(1)
		flushFrame(1)
		expect(spies.render).toHaveBeenCalledTimes(2)
	})
})

describe('анимация активной ячейки', () => {
	it('играет только у активной; прогресс по времени и длительности, кадры идут, пока есть шаг', () => {
		const spin = vi.fn()
		const idle = vi.fn()
		const { thumbs } = setup({ getDuration: () => 1000 })
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), instance({ spin }))
		thumbs.add('b', cellAt(rect(100, 0, 50, 50)), instance({ spin: idle }))
		thumbs.setActive('a', 'spin')
		flushFrame(1000)
		expect(spin).toHaveBeenLastCalledWith(0)
		expect(queue).toHaveLength(1)
		flushFrame(1250)
		expect(spin).toHaveBeenLastCalledWith(expect.closeTo(0.25))
		flushFrame(2500)
		expect(spin).toHaveBeenLastCalledWith(expect.closeTo(0.5))
		expect(idle).not.toHaveBeenCalled()
	})

	it('длительность по умолчанию 900 мс; анимация по умолчанию — pulse', () => {
		const pulse = vi.fn()
		const { thumbs } = setup()
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), instance({ pulse }))
		thumbs.setActive('a')
		flushFrame(100)
		flushFrame(550)
		expect(pulse).toHaveBeenLastCalledWith(0.5)
	})

	it('у модели нет такой анимации: рисуется один раз, цикла нет', () => {
		const { thumbs, spies } = setup()
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), { object: new Group() })
		thumbs.setActive('a', 'spin')
		flushFrame(10)
		expect(queue).toHaveLength(0)
		expect(spies.render).toHaveBeenCalledTimes(1)
	})

	it('активная ячейка удалена: кадр рисуется без анимации', () => {
		const { thumbs } = setup()
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), instance({ pulse: vi.fn() }))
		thumbs.setActive('a')
		thumbs.remove('a')
		flushFrame(10)
		expect(queue).toHaveLength(0)
	})

	it('setActive(null) останавливает анимацию', () => {
		const pulse = vi.fn()
		const { thumbs } = setup()
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), instance({ pulse }))
		thumbs.setActive('a')
		flushFrame(10)
		thumbs.setActive(null)
		flushFrame(20)
		expect(queue).toHaveLength(0)
		expect(pulse).toHaveBeenCalledTimes(1)
	})

	it('«уменьшить движение»: без цикла, но кадр рисуется', () => {
		const pulse = vi.fn()
		const { thumbs, spies } = setup({ isReducedMotion: () => true })
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), instance({ pulse }))
		thumbs.setActive('a')
		flushFrame(10)
		expect(pulse).not.toHaveBeenCalled()
		expect(queue).toHaveLength(0)
		expect(spies.render).toHaveBeenCalledTimes(1)
	})
})

describe('dispose', () => {
	it('отменяет кадр, убирает модели, освобождает рендерер и теряет контекст', () => {
		const { thumbs, spies } = setup()
		const item = instance()
		thumbs.add('a', cellAt(rect(0, 0, 50, 50)), item)
		const holder = item.object.parent!
		thumbs.dispose()
		expect(cancel).toHaveBeenCalled()
		expect(holder.parent).toBeNull()
		expect(spies.dispose).toHaveBeenCalledTimes(1)
		expect(spies.forceContextLoss).toHaveBeenCalledTimes(1)
	})

	it('без запланированного кадра тоже работает', () => {
		const { thumbs, spies } = setup()
		thumbs.dispose()
		expect(spies.forceContextLoss).toHaveBeenCalledTimes(1)
	})
})
