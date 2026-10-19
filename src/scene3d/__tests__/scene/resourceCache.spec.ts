import { createResourceCache } from '../../scene/resourceCache'
import { BufferGeometry, MeshBasicMaterial, Texture } from 'three'

const MAKERS = {
	geometry: () => new BufferGeometry(),
	material: () => new MeshBasicMaterial(),
	texture: () => new Texture(),
}

function expectShared<T extends object>(take: (key: string, build: () => T) => T, make: () => T): void {
	const build = vi.fn(make)
	const first = take('k', build)
	expect(take('k', build)).toBe(first)
	expect(build).toHaveBeenCalledTimes(1)
	expect(take('other', build)).not.toBe(first)
}

describe('createResourceCache', () => {
	it('геометрия, материал и текстура: один ключ — один объект, build вызывается раз', () => {
		const cache = createResourceCache()
		expectShared(cache.geometry, MAKERS.geometry)
		expectShared(cache.material, MAKERS.material)
		expectShared(cache.texture, MAKERS.texture)
	})

	it('счёт ссылок: dispose только когда ссылок не осталось, потом ресурс строится заново', () => {
		const cache = createResourceCache()
		const build = vi.fn(MAKERS.geometry)
		const value = cache.geometry('k', build)
		const dispose = vi.spyOn(value, 'dispose')
		cache.geometry('k', build)
		cache.release('geometry', 'k')
		expect(dispose).not.toHaveBeenCalled()
		cache.release('geometry', 'k')
		expect(dispose).toHaveBeenCalledTimes(1)
		expect(cache.geometry('k', build)).not.toBe(value)
		expect(build).toHaveBeenCalledTimes(2)
	})

	it('виды ресурсов не пересекаются по ключу', () => {
		const cache = createResourceCache()
		const geometry = cache.geometry('k', MAKERS.geometry)
		const material = cache.material('k', MAKERS.material)
		const [geometryDispose, materialDispose] = [vi.spyOn(geometry, 'dispose'), vi.spyOn(material, 'dispose')]
		cache.release('material', 'k')
		expect(materialDispose).toHaveBeenCalled()
		expect(geometryDispose).not.toHaveBeenCalled()
	})

	it('неизвестный ключ и лишний release ничего не ломают', () => {
		const cache = createResourceCache()
		expect(() => cache.release('texture', 'нет')).not.toThrow()
		const value = cache.texture('k', MAKERS.texture)
		const dispose = vi.spyOn(value, 'dispose')
		cache.release('texture', 'k')
		cache.release('texture', 'k')
		expect(dispose).toHaveBeenCalledTimes(1)
	})

	it('dispose освобождает всё разом и очищает кеш', () => {
		const cache = createResourceCache()
		const geometry = cache.geometry('a', MAKERS.geometry)
		const material = cache.material('a', MAKERS.material)
		const texture = cache.texture('a', MAKERS.texture)
		const spies = [vi.spyOn(geometry, 'dispose'), vi.spyOn(material, 'dispose'), vi.spyOn(texture, 'dispose')]
		cache.geometry('a', MAKERS.geometry)
		cache.dispose()
		spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1))
		expect(cache.geometry('a', MAKERS.geometry)).not.toBe(geometry)
		cache.release('geometry', 'a')
		expect(spies[0]).toHaveBeenCalledTimes(1)
	})
})
