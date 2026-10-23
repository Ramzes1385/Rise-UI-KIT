import { Vector3 } from 'three'
import { createResourceCache } from '@/scene3d/scene/resourceCache'
import { buildContent } from '../../../model/scene/roadmap3dContent'
import { snapshotOf, testPalette } from '../../fixtures/model.test-utils'
import { ROADMAP_3D_GOAL, ROADMAP_3D_START } from '../../../model/data/roadmap3dTags'
import type { Roadmap3DBuildOptions, Roadmap3DSnapshot, Roadmap3DStates } from '../../../types/internal/roadmap3dInternal.types'

const IDLE: Roadmap3DStates = { hover: null, focus: null, selected: null, currentId: null }
const DETAIL = { hasTrees: true, hasClouds: true, hasShadows: true }

function optionsFor(snapshot: Roadmap3DSnapshot, patch: Partial<Roadmap3DBuildOptions> = {}): Roadmap3DBuildOptions {
	return {
		snapshot,
		palette: testPalette(),
		detail: DETAIL,
		appModels: {},
		runtime: {
			loop: {
				invalidate: vi.fn(),
				animate: vi.fn(() => () => undefined),
				onFrame: vi.fn(() => () => undefined),
				onBeforeRender: vi.fn(() => () => undefined),
			},
			cache: createResourceCache(),
			getModels: () => ({}),
			isReducedMotion: () => true,
			onModelReady: vi.fn(),
			onFocus: vi.fn(),
		},
		...patch,
	}
}

describe('buildContent', () => {
	it('собирает остров, дорогу, пьедесталы, маркеры и декор; якоря этапов, старта и цели', () => {
		const snapshot = snapshotOf()
		const content = buildContent(optionsFor(snapshot))
		expect(content.root.children.length).toBeGreaterThan(5)
		expect(content.registry.getHandles()).toHaveLength(4)
		expect(content.anchors.get('basics')).toBeInstanceOf(Vector3)
		expect(content.anchors.has(ROADMAP_3D_START)).toBe(true)
		expect(content.anchors.has(ROADMAP_3D_GOAL)).toBe(true)
		expect(content.bounds.isEmpty()).toBe(false)
		content.dispose()
	})

	it('без гор цель — на площадке цели, без дороги — нет якоря старта', () => {
		const snapshot = snapshotOf()
		const bare: Roadmap3DSnapshot = {
			...snapshot,
			island: { ...snapshot.island, mountains: [], layout: { ...snapshot.island.layout, road: [] } },
		}
		const content = buildContent(optionsFor(bare))
		expect(content.anchors.has(ROADMAP_3D_START)).toBe(false)
		expect(content.anchors.get(ROADMAP_3D_GOAL)?.y).toBeCloseTo(1.9)
		content.dispose()
	})

	it('без текущего этапа пин прячется; с текущим — стоит над ним', () => {
		const snapshot = snapshotOf()
		const content = buildContent(optionsFor({ ...snapshot, currentIndex: -1 }))
		const pin = content.markers.group.children[1]
		expect(pin.visible).toBe(false)
		content.update(snapshot, IDLE)
		expect(pin.visible).toBe(true)
		content.update({ ...snapshot, currentIndex: -1 }, IDLE)
		expect(pin.visible).toBe(false)
		content.dispose()
	})

	it('update перекрашивает пьедесталы и обновляет модели только у изменённых этапов', () => {
		const snapshot = snapshotOf()
		const content = buildContent(optionsFor(snapshot))
		const update = vi.spyOn(content.registry, 'update')
		content.update(snapshot, IDLE)
		expect(update).not.toHaveBeenCalled()
		const stages = snapshot.stages.map((item, index) =>
			index === 0 ? { ...item, title: 'Другое', selection: { ...item.selection, model3d: { model: 'gear' } } } : item,
		)
		content.update({ ...snapshot, stages }, { ...IDLE, hover: 'basics', focus: 'frame', selected: 'frame', currentId: 'frame' })
		expect(update).toHaveBeenCalledTimes(1)
		content.setStates(IDLE)
		content.dispose()
	})

	it('recolor перекрашивает все части и обновляет свет и модели; dispose освобождает сцену', () => {
		const snapshot = snapshotOf()
		const content = buildContent(optionsFor(snapshot))
		expect(() => content.recolor(testPalette())).not.toThrow()
		expect(() => content.dispose()).not.toThrow()
	})

	it('без деревьев и облаков перекраска не падает на пустых мешах', () => {
		const content = buildContent(optionsFor(snapshotOf(), { detail: { hasTrees: false, hasClouds: false, hasShadows: false } }))
		expect(() => content.recolor(testPalette())).not.toThrow()
		content.dispose()
	})
})
