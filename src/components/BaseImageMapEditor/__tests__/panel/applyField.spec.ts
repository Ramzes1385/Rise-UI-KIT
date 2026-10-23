import { applyField, parsePoints } from '../../model/panel/applyField'
import type { ImageMapObject } from '../../../BaseImageMap/types/imageMapData.types'

function rect(extra: Partial<ImageMapObject> = {}): ImageMapObject {
	return { id: 'rect-1', title: 'Зал', type: 'rect', x: 0, y: 0, width: 0.1, height: 0.1, ...extra } as ImageMapObject
}

describe('applyField: геометрия', () => {
	it('проценты переводятся в доли', () => {
		const object = rect()
		applyField(object, 'geo.x', 25)
		applyField(object, 'geo.y', '12.345678')
		applyField(object, 'geo.width', 150)
		applyField(object, 'geo.height', null)
		expect(object).toMatchObject({ x: 0.25, y: 0.1235, width: 1, height: 0 })
	})

	it('радиусы эллипса и прижатие снизу', () => {
		const object: ImageMapObject = { id: 'e', title: '', type: 'ellipse', x: 0.5, y: 0.5, rx: 0.1, ry: 0.1 }
		applyField(object, 'geo.rx', 40)
		applyField(object, 'geo.ry', -10)
		expect(object).toMatchObject({ rx: 0.4, ry: 0 })
	})
})

describe('applyField: стиль', () => {
	it('style.* пишет в style.base', () => {
		const object = rect()
		applyField(object, 'style.fill', 'red')
		applyField(object, 'style.stroke', 'blue')
		applyField(object, 'style.fillOpacity', 0.5)
		expect(object.style).toEqual({ base: { fill: 'red', stroke: 'blue', fillOpacity: 0.5 } })
	})

	it('пустое значение удаляет ключ, пустой base — и base, и style', () => {
		const object = rect({ style: { base: { fill: 'red', stroke: 'blue' } } })
		applyField(object, 'style.fill', '')
		expect(object.style).toEqual({ base: { stroke: 'blue' } })
		applyField(object, 'style.stroke', null)
		expect(object).not.toHaveProperty('style')
	})

	it('другие состояния стиля сохраняются при пустом base', () => {
		const object = rect({ style: { base: { fill: 'red' }, hover: { fill: 'blue' } } })
		applyField(object, 'style.fill', '')
		expect(object.style).toEqual({ hover: { fill: 'blue' } })
	})

	it('именованный стиль заменяется объектом', () => {
		const object = rect({ style: 'accent' })
		applyField(object, 'style.fill', 'green')
		expect(object.style).toEqual({ base: { fill: 'green' } })
	})

	it('пустое значение у объекта без стиля не создаёт style', () => {
		const object = rect()
		applyField(object, 'style.fill', '')
		expect(object).not.toHaveProperty('style')
	})

	it('styleName пишет поле style, пустое удаляет', () => {
		const object = rect({ style: { base: { fill: 'red' } } })
		applyField(object, 'styleName', 'accent')
		expect(object.style).toBe('accent')
		applyField(object, 'styleName', '')
		expect(object).not.toHaveProperty('style')
	})
})

describe('applyField: прочие поля', () => {
	it('значения задаются', () => {
		const object = rect()
		applyField(object, 'title', 'Холл')
		applyField(object, 'isDisabled', true)
		applyField(object, 'tags', ['a'])
		expect(object).toMatchObject({ title: 'Холл', isDisabled: true, tags: ['a'] })
	})

	it("'', false, [] и null удаляют поле", () => {
		const object = rect({ description: 'Текст', isDisabled: true, tags: ['a'], image: 'x.png' })
		applyField(object, 'description', '')
		applyField(object, 'isDisabled', false)
		applyField(object, 'tags', [])
		applyField(object, 'image', null)
		expect(object).not.toHaveProperty('description')
		expect(object).not.toHaveProperty('isDisabled')
		expect(object).not.toHaveProperty('tags')
		expect(object).not.toHaveProperty('image')
	})

	it('ноль — не пустое значение', () => {
		const object = rect()
		applyField(object, 'zoom', 0)
		expect(object.zoom).toBe(0)
	})
})

describe('parsePoints', () => {
	it('разделители «;», «,» и пробел; пустые строки пропускаются', () => {
		expect(parsePoints('10; 20\n\n  30,40  \n50 60\n')).toEqual([
			[0.1, 0.2],
			[0.3, 0.4],
			[0.5, 0.6],
		])
	})

	it('проценты прижаты к 0–1 и округлены', () => {
		expect(parsePoints('-10; 150\n12.345678; 0\n100; 100')).toEqual([
			[0, 1],
			[0.1235, 0],
			[1, 1],
		])
	})

	it('меньше трёх строк — undefined', () => {
		expect(parsePoints('10; 20\n30; 40')).toBeUndefined()
		expect(parsePoints('')).toBeUndefined()
	})

	it('не числа и не пары — undefined', () => {
		expect(parsePoints('10; a\n30; 40\n50; 60')).toBeUndefined()
		expect(parsePoints('10; 20; 30\n30; 40\n50; 60')).toBeUndefined()
		expect(parsePoints('10\n30; 40\n50; 60')).toBeUndefined()
	})
})
