import { vi } from 'vitest'
import { shapeView } from '../../../../model/render/shapes/flowShapes'
import type { FlowShapeDef } from '../../../../types/api/flowNotation.types'
import type { FlowEdgeKindDef } from '../../../../types/api/flowNotation.types'
import { collectMarkers, endMarkerOf, startMarkerOf } from '../../../../model/render/flowMarkers'

const size = { width: 120, height: 60 }
const RECT = 'M0 0H120V60H0Z'

describe('shapeView', () => {
	it.each([
		{ shape: 'rect' },
		{ shape: 'round-rect' },
		{ shape: 'pill' },
		{ shape: 'ellipse' },
		{ shape: 'circle' },
		{ shape: 'diamond' },
		{ shape: 'hexagon' },
		{ shape: 'parallelogram' },
		{ shape: 'parallel-lines' },
	])('простая фигура $shape: контур без внутренней линии и без NaN', ({ shape }) => {
		const view = shapeView({ shape } as FlowShapeDef, size)
		expect(view.path.startsWith('M')).toBe(true)
		expect(view.path).not.toContain('NaN')
		expect(view.inner).toBeNull()
	})

	it.each([
		{ shape: 'cylinder', hasInner: true },
		{ shape: 'document', hasInner: false },
		{ shape: 'person', hasInner: true },
		{ shape: 'note', hasInner: true },
		{ shape: 'open-rect', hasInner: true },
	])('составная фигура $shape', ({ shape, hasInner }) => {
		const view = shapeView({ shape } as FlowShapeDef, size)
		expect(view.path).not.toContain('NaN')
		expect(view.inner !== null).toBe(hasInner)
	})

	it('свой контур path берёт функцию из описания, без функции и неизвестная фигура — прямоугольник', () => {
		const path = vi.fn(() => 'M0 0L5 5')
		expect(shapeView({ shape: 'path', path } as FlowShapeDef, size)).toEqual({ path: 'M0 0L5 5', inner: null })
		expect(path).toHaveBeenCalledWith(size)
		expect(shapeView({ shape: 'path' } as FlowShapeDef, size).path).toBe(RECT)
		expect(shapeView({ shape: 'unknown' } as unknown as FlowShapeDef, size).path).toBe(RECT)
	})

	it('цилиндр на низком узле ограничивает радиус эллипса', () => {
		const view = shapeView({ shape: 'cylinder' } as FlowShapeDef, { width: 100, height: 20 })
		expect(view.path).toContain('A50 5 ')
	})
})

describe('маркеры связей', () => {
	const kind = (patch: Partial<FlowEdgeKindDef>): FlowEdgeKindDef => ({ label: () => 'k', stroke: 'solid', ...patch })

	it('конец и начало по имени; none и неизвестное — без маркера', () => {
		expect(endMarkerOf(kind({ endMarker: 'arrow' }))?.id).toBe('arrow')
		expect(endMarkerOf(kind({ endMarker: 'open-arrow' }))?.isFilled).toBe(false)
		expect(endMarkerOf(kind({ endMarker: 'double-arrow' }))?.paths).toHaveLength(2)
		expect(endMarkerOf(kind({}))).toBeNull()
		expect(endMarkerOf(kind({ endMarker: 'none' }))).toBeNull()
		expect(startMarkerOf(kind({ startMarker: 'circle' }))?.id).toBe('circle')
		expect(startMarkerOf(kind({ startMarker: 'diamond' }))?.id).toBe('diamond')
		expect(startMarkerOf(kind({ startMarker: 'slash' }))?.refX).toBe(5)
		expect(startMarkerOf(kind({}))).toBeNull()
	})

	it('collectMarkers собирает без повторов', () => {
		const found = collectMarkers([kind({ endMarker: 'arrow', startMarker: 'circle' }), kind({ endMarker: 'arrow' }), kind({})])
		expect(found.map(item => item.id)).toEqual(['arrow', 'circle'])
		expect(collectMarkers([])).toEqual([])
	})
})
