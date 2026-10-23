import { shallowRef } from 'vue'
import { Color, InstancedMesh } from 'three'
import type { FlowMap3DContent, FlowMap3DEdgeItem, FlowMap3DPalette } from '../../types/internal/flowMap3dInternal.types'
import { createParticles, distributeParticles, particleDistance, useParticles } from '../../model/motion/particles/useParticles'

const palette = { palette: {}, resolve: () => new Color('#336699') } as unknown as FlowMap3DPalette

function item(id: string, from: string, ...rest: [to: string, extra?: Partial<FlowMap3DEdgeItem>]): FlowMap3DEdgeItem {
	return {
		id,
		edge: { id, source: from, target: rest[0] },
		stroke: 'solid',
		hasParticles: true,
		points: [
			{ x: 0, y: 0, z: 0 },
			{ x: 4, y: 0, z: 0 },
		],
		...rest[1],
	} as FlowMap3DEdgeItem
}

describe('particleDistance', () => {
	it('место частицы — чистая функция времени и номера', () => {
		expect(particleDistance(10, { index: 0, count: 2 }, 0)).toBe(0)
		expect(particleDistance(10, { index: 1, count: 2 }, 0)).toBe(5)
		expect(particleDistance(10, { index: 0, count: 2 }, 2)).toBeCloseTo(2.2)
		expect(particleDistance(10, { index: 0, count: 2 }, 2)).toBe(particleDistance(10, { index: 0, count: 2 }, 2))
	})

	it('идёт по кругу, в том числе при отрицательном времени; без длины стоит на месте', () => {
		expect(particleDistance(10, { index: 0, count: 1 }, 10 / 1.1)).toBeCloseTo(0)
		expect(particleDistance(10, { index: 0, count: 1 }, -1)).toBeCloseTo(8.9)
		expect(particleDistance(0, { index: 0, count: 1 }, 5)).toBe(0)
		expect(particleDistance(-3, { index: 0, count: 1 }, 5)).toBe(0)
	})
})

describe('distributeParticles', () => {
	it('без частиц или без связей раздаёт нули', () => {
		expect(distributeParticles([5, 5], 0)).toEqual([0, 0])
		expect(distributeParticles([5, 5], -4)).toEqual([0, 0])
		expect(distributeParticles([], 10)).toEqual([])
	})

	it('делит пропорционально длине и сохраняет сумму', () => {
		const counts = distributeParticles([30, 10, 10], 10)
		expect(counts.reduce((sum, value) => sum + value, 0)).toBe(10)
		expect(counts[0]).toBeGreaterThan(counts[1])
		expect(counts.every(value => value >= 1)).toBe(true)
	})

	it('если мелких связей много, лишнее забирается у самых нагруженных', () => {
		const counts = distributeParticles([100, 1, 1], 4)
		expect(counts.reduce((sum, value) => sum + value, 0)).toBe(4)
		expect(counts).toEqual([2, 1, 1])
	})

	it('если связей больше, чем частиц, частицы достаются самым длинным по одной', () => {
		expect(distributeParticles([1, 1, 1], 2)).toEqual([1, 1, 0])
		expect(distributeParticles([1, 9, 5], 2)).toEqual([0, 1, 1])
	})

	it('суммы нулевой длины не делят на ноль', () => {
		expect(distributeParticles([0, 0], 5).reduce((sum, value) => sum + value, 0)).toBe(5)
	})

	it('когда связей не меньше частиц, по одной достаётся самым длинным', () => {
		expect(distributeParticles([1, 9, 5, 3], 2)).toEqual([0, 1, 1, 0])
	})

	it('число частиц целое и не больше 2000', () => {
		expect(distributeParticles([10], 2.9)).toEqual([2])
		expect(distributeParticles([10], 99999)).toEqual([2000])
	})
})

describe('createParticles', () => {
	const items = [item('call', 'a', 'b'), item('event', 'b', 'c', { stroke: 'dashed' }), item('quiet', 'c', 'd', { hasParticles: false })]

	it('строит по мешу на вид частиц и считает общее число', () => {
		const particles = createParticles(items, 6, palette)
		expect(particles.hasParticles).toBe(true)
		expect(particles.count).toBe(6)
		expect(particles.group?.children).toHaveLength(2)
	})

	it('без связей с частицами группы нет', () => {
		const particles = createParticles([items[2]], 6, palette)
		expect(particles.group).toBeNull()
		expect(particles.hasParticles).toBe(false)
		particles.place(1)
		expect(particles.count).toBe(0)
	})

	it('связи без пути или нулевой длины в частицы не попадают', () => {
		const flat = item('flat', 'a', 'b', {
			points: [
				{ x: 1, y: 1, z: 1 },
				{ x: 1, y: 1, z: 1 },
			],
		})
		const single = item('single', 'a', 'b', { points: [{ x: 1, y: 1, z: 1 }] })
		expect(createParticles([flat, single], 6, palette).group).toBeNull()
	})

	it('положения частиц одинаковы для одного времени и различны для разного', () => {
		const first = createParticles(items, 6, palette)
		const second = createParticles(items, 6, palette)
		const matrices = (particles: ReturnType<typeof createParticles>) =>
			(particles.group?.children as InstancedMesh[]).map(mesh => Array.from(mesh.instanceMatrix.array))
		first.place(1.5)
		second.place(1.5)
		expect(matrices(first)).toEqual(matrices(second))
		second.place(2.5)
		expect(matrices(first)).not.toEqual(matrices(second))
		expect((first.group?.children[0] as InstancedMesh).instanceMatrix.version).toBeGreaterThan(0)
	})

	it('связи с неработающим узлом умолкают, а потом оживают', () => {
		const particles = createParticles([item('call', 'a', 'b')], 2, palette)
		const mesh = particles.group?.children[0] as InstancedMesh
		particles.setTones(new Map([['a', 'muted']]))
		expect(mesh.instanceMatrix.array[0]).toBe(0)
		particles.setTones(new Map([['b', 'muted']]))
		particles.place(1)
		expect(mesh.instanceMatrix.array[0]).toBe(0)
		particles.setTones(new Map())
		expect(mesh.instanceMatrix.array[0]).toBe(1)
		particles.setTones(new Map([['a', 'success']]))
		expect(mesh.instanceMatrix.array[0]).toBe(1)
	})

	it('видимость складывается из «включено» и «не приостановлено»', () => {
		const particles = createParticles(items, 6, palette)
		particles.setVisible(false)
		expect(particles.group?.visible).toBe(false)
		particles.setVisible(true)
		particles.setSuspended(true)
		expect(particles.group?.visible).toBe(false)
		particles.setSuspended(false)
		expect(particles.group?.visible).toBe(true)
	})

	it('перекраска и освобождение работают на всех мешах', () => {
		const particles = createParticles(items, 6, palette)
		particles.recolor({ ...palette, resolve: () => new Color('#ff0000') })
		const meshes = particles.group?.children as InstancedMesh[]
		expect((meshes[0].material as unknown as { color: Color }).color.getHexString()).toBe('ff0000')
		const dispose = vi.spyOn(meshes[0].geometry, 'dispose')
		particles.dispose()
		expect(dispose).toHaveBeenCalled()
	})
})

describe('useParticles', () => {
	function setup(hasParticles = true, content: FlowMap3DContent | null = null) {
		const particles = createParticles([item('call', 'a', 'b')], 4, palette)
		const place = vi.spyOn(particles, 'place')
		const setVisible = vi.spyOn(particles, 'setVisible')
		const stopTick = vi.fn()
		let tick: ((delta: number) => void) | null = null
		const animate = vi.fn((next: (delta: number) => void) => {
			tick = next
			return stopTick
		})
		const invalidate = vi.fn()
		const options = { getHasParticles: () => hasParticles, animate, viewport: { invalidate } }
		const shown = shallowRef((content ?? { particles }) as FlowMap3DContent | null)
		return { api: useParticles(options as never, shown), place, setVisible, animate, stopTick, invalidate, tick: () => tick, shown }
	}

	it('без собранной сцены ничего не делает', () => {
		const { api, animate, shown } = setup()
		shown.value = null
		api.apply()
		expect(animate).not.toHaveBeenCalled()
	})

	it('включённые частицы ставятся на место и идут по кадрам; время копится по шагам', () => {
		const { api, place, animate, tick, invalidate } = setup()
		api.apply()
		expect(place).toHaveBeenCalledWith(0)
		expect(invalidate).toHaveBeenCalled()
		expect(animate).toHaveBeenCalledOnce()
		tick()?.(0.5)
		tick()?.(0.25)
		expect(place).toHaveBeenLastCalledWith(0.75)
	})

	it('выключенные частицы стоят в начале и кадры не просят; повторный запуск останавливает прежний', () => {
		const off = setup(false)
		off.api.apply()
		expect(off.setVisible).toHaveBeenCalledWith(false)
		expect(off.animate).not.toHaveBeenCalled()
		const on = setup()
		on.api.apply()
		on.api.apply()
		expect(on.stopTick).toHaveBeenCalledOnce()
		on.api.stop()
		expect(on.stopTick).toHaveBeenCalledTimes(2)
	})
})
