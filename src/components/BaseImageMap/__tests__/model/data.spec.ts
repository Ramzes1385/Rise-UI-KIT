import { resolveObject } from '../../model/data/resolveObject'
import { objectArea, shapeGeometry } from '../../model/data/shapeGeometry'
import type { ImageMapData, ImageMapObject } from '../../types/imageMapData.types'
import { objectAttributes, objectClasses } from '../../model/data/objectAttributes'

const LAYER = { id: 'plan', title: 'План', width: 1000, height: 500 }

const DATA: ImageMapData = {
	layers: [LAYER, { id: 'roof', title: 'Крыша', width: 1000, height: 500 }],
	objects: [],
	groups: [
		{ id: 'colored', title: 'Цветная', color: 'red', style: 'thin' },
		{ id: 'named', title: 'Со стилем', style: 'thin' },
		{ id: 'plain', title: 'Простая' },
		{ id: 'missing-style', title: 'Нет стиля', style: 'unknown' },
	],
	styles: {
		thin: { base: { strokeWidth: 1 }, hover: { fill: 'blue', fillOpacity: 0.5 } },
		bold: { base: { stroke: 'black', fillOpacity: 0 }, active: { strokeWidth: 3 } },
	},
}

const point = (extra: Partial<ImageMapObject> = {}): ImageMapObject =>
	({ id: 'p', type: 'point', title: 'Точка', x: 0.1, y: 0.2, ...extra }) as ImageMapObject
const STATE = { isTabbable: false, isActive: false, isHovered: false, isPulsing: false }

describe('resolveObject — действие', () => {
	it('без action берёт defaultAction', () => {
		expect(resolveObject(point(), DATA, 'popup').action).toBe('popup')
		expect(resolveObject(point({ action: 'none' }), DATA, 'popup').action).toBe('none')
	})

	it('link с безопасным адресом даёт href, с опасным или без адреса — none', () => {
		const safe = resolveObject(point({ action: 'link', link: '/shop' }), DATA, 'popup')
		expect(safe).toMatchObject({ action: 'link', href: '/shop' })
		expect(resolveObject(point({ action: 'link', link: 'javascript:alert(1)' }), DATA, 'popup')).toMatchObject({
			action: 'none',
			href: undefined,
		})
		expect(resolveObject(point({ action: 'link' }), DATA, 'popup').action).toBe('none')
	})

	it('layer с несуществующим targetLayer становится none', () => {
		expect(resolveObject(point({ action: 'layer', targetLayer: 'roof' }), DATA, 'popup').action).toBe('layer')
		expect(resolveObject(point({ action: 'layer', targetLayer: 'cellar' }), DATA, 'popup').action).toBe('none')
	})

	it('isDisabled приводится к boolean, группа находится по id', () => {
		const item = resolveObject(point({ isDisabled: true, group: 'plain' }), DATA, 'none')
		expect(item.isDisabled).toBe(true)
		expect(item.group?.title).toBe('Простая')
		expect(resolveObject(point({ group: 'nope' }), DATA, 'none').group).toBeUndefined()
	})
})

describe('resolveObject — стиль', () => {
	it('без групп и стилей — пустой набор переменных', () => {
		expect(resolveObject(point(), { layers: [LAYER], objects: [] }, 'none').style).toEqual({})
		expect(resolveObject(point({ group: 'plain' }), DATA, 'none').style).toEqual({})
		expect(resolveObject(point({ group: 'missing-style' }), DATA, 'none').style).toEqual({})
	})

	it('цвет группы, затем именованный стиль группы', () => {
		expect(resolveObject(point({ group: 'colored' }), DATA, 'none').style).toEqual({
			'--im-fill': 'red',
			'--im-stroke': 'red',
			'--im-stroke-width': '1px',
			'--im-fill-hover': 'blue',
			'--im-fill-opacity-hover': '0.5',
		})
		expect(resolveObject(point({ group: 'named' }), DATA, 'none').style).toEqual({
			'--im-stroke-width': '1px',
			'--im-fill-hover': 'blue',
			'--im-fill-opacity-hover': '0.5',
		})
	})

	it('стиль объекта по имени и объектом перекрывает группу', () => {
		expect(resolveObject(point({ group: 'colored', style: 'bold' }), DATA, 'none').style).toMatchObject({
			'--im-fill': 'red',
			'--im-stroke': 'black',
			'--im-fill-opacity': '0',
			'--im-stroke-width-active': '3px',
		})
		expect(resolveObject(point({ style: 'unknown' }), DATA, 'none').style).toEqual({})
		expect(resolveObject(point({ style: 'bold' }), { layers: [LAYER], objects: [] }, 'none').style).toEqual({})
		expect(resolveObject(point({ style: { active: { fill: 'green' } } }), DATA, 'none').style).toEqual({ '--im-fill-active': 'green' })
	})
})

describe('shapeGeometry и objectArea', () => {
	it('rect: координаты в единицах слоя, радиус от ширины', () => {
		const rect = { id: 'r', type: 'rect', title: 'R', x: 0.1, y: 0.2, width: 0.3, height: 0.4, radius: 0.01 } as const
		expect(shapeGeometry(rect, LAYER)).toEqual({ tag: 'rect', attributes: { x: 100, y: 100, width: 300, height: 200, rx: 10 } })
		expect(shapeGeometry({ ...rect, radius: undefined }, LAYER)?.attributes.rx).toBe(0)
		expect(objectArea(rect)).toEqual({ x: 0.1, y: 0.2, width: 0.3, height: 0.4 })
	})

	it('ellipse: центр и радиусы, область — описанный прямоугольник', () => {
		const ellipse = { id: 'e', type: 'ellipse', title: 'E', x: 0.5, y: 0.5, rx: 0.1, ry: 0.2 } as const
		expect(shapeGeometry(ellipse, LAYER)).toEqual({ tag: 'ellipse', attributes: { cx: 500, cy: 250, rx: 100, ry: 100 } })
		const area = objectArea(ellipse)
		expect(area?.x).toBeCloseTo(0.4)
		expect(area?.y).toBeCloseTo(0.3)
		expect(area?.width).toBeCloseTo(0.2)
		expect(area?.height).toBeCloseTo(0.4)
	})

	it('polygon: строка points и описанный прямоугольник', () => {
		const polygon = {
			id: 'g',
			type: 'polygon',
			title: 'G',
			points: [
				[0.1, 0.2],
				[0.5, 0.1],
				[0.3, 0.6],
			],
		} as ImageMapObject
		expect(shapeGeometry(polygon, LAYER)).toEqual({ tag: 'polygon', attributes: { points: '100,100 500,50 300,300' } })
		const area = objectArea(polygon)
		expect(area?.x).toBeCloseTo(0.1)
		expect(area?.width).toBeCloseTo(0.4)
		expect(area?.height).toBeCloseTo(0.5)
	})

	it('point — область нулевого размера и без фигуры; svg — без фигуры и без области', () => {
		expect(shapeGeometry(point(), LAYER)).toBeUndefined()
		expect(objectArea(point())).toEqual({ x: 0.1, y: 0.2, width: 0, height: 0 })
		const svg = { id: 's', type: 'svg', title: 'S', elementId: 'room' } as const
		expect(shapeGeometry(svg, LAYER)).toBeUndefined()
		expect(objectArea(svg)).toBeUndefined()
	})
})

describe('objectAttributes и objectClasses', () => {
	it('классы по состоянию и типу', () => {
		const item = resolveObject(point({ isDisabled: true }), DATA, 'none')
		expect(objectClasses(item, { ...STATE, isActive: true, isHovered: true, isPulsing: true })).toEqual({
			'base-image-map__object--point': true,
			'base-image-map__object--active': true,
			'base-image-map__object--hover': true,
			'base-image-map__object--disabled': true,
			'base-image-map__object--pulsing': true,
			'base-image-map__object--filtered': false,
		})
	})

	it('нативная кнопка: type=button, tabindex, aria-*', () => {
		const item = resolveObject(point({ isDisabled: true }), DATA, 'popup')
		expect(objectAttributes(item, { ...STATE, isTabbable: true, isActive: true }, true)).toEqual({
			'data-image-map-object': 'p',
			type: 'button',
			tabindex: '0',
			'aria-label': 'Точка',
			'aria-disabled': 'true',
			'aria-current': 'true',
			'aria-haspopup': 'dialog',
		})
	})

	it('describedBy становится aria-describedby', () => {
		const item = resolveObject(point(), DATA, 'popup')
		expect(objectAttributes(item, { ...STATE, describedBy: 'tip-1' }, false)['aria-describedby']).toBe('tip-1')
		expect(objectAttributes(item, STATE, false)['aria-describedby']).toBeUndefined()
	})

	it('нативная ссылка: href, внешняя — target и rel', () => {
		const inner = resolveObject(point({ action: 'link', link: '/a' }), DATA, 'none')
		expect(objectAttributes(inner, STATE, true)).toMatchObject({
			href: '/a',
			target: undefined,
			rel: undefined,
			type: undefined,
			tabindex: '-1',
		})
		const outer = resolveObject(point({ action: 'link', link: 'https://example.com', isLinkExternal: true }), DATA, 'none')
		expect(objectAttributes(outer, STATE, true)).toMatchObject({ target: '_blank', rel: 'noopener noreferrer' })
	})

	it('фигура: role button или link, без href и aria-haspopup у не-popup', () => {
		const button = resolveObject(point(), DATA, 'none')
		expect(objectAttributes(button, STATE, false)).toMatchObject({ role: 'button', type: undefined, 'aria-haspopup': undefined })
		const link = resolveObject(point({ action: 'link', link: '/a' }), DATA, 'none')
		expect(objectAttributes(link, STATE, false)).toMatchObject({ role: 'link' })
		expect(objectAttributes(link, STATE, false)).not.toHaveProperty('href')
	})
})
