import { buildTags } from '../../../model/data/roadmap3dTags'
import { mountSnapshot } from '../../fixtures/model.test-utils'
import type { Scene3DLabelSpot } from '@/scene3d/types/internal/scene3dInternal.types'
import type { Roadmap3DTag, Roadmap3DTagEntry } from '../../../types/internal/roadmap3dInternal.types'
import { ROADMAP_3D_COMPACT_CLASS, layoutTags, resolveTagForms, tagRank } from '../../../model/data/roadmap3dTagLayout'

const IDLE = { hover: null, focus: null, selected: null, currentId: null }

function entry(id: string, patch: Partial<Roadmap3DTagEntry> = {}): Roadmap3DTagEntry {
	return {
		id,
		kind: 'stage',
		rank: 3,
		order: 0,
		x: 100,
		y: 100,
		full: { width: 100, height: 40 },
		compact: { width: 24, height: 24 },
		isVisible: true,
		...patch,
	}
}

describe('tagRank', () => {
	it('текущий, выбранный, фокус и тема — выше всех; цель, соседи текущего, прочие этапы, старт', () => {
		const { snapshot } = mountSnapshot()
		const tags = buildTags(snapshot.value, { ...IDLE, focus: 'build' }, null)
		const rank = (id: string) => tagRank(tags.find(tag => tag.id === id) as Roadmap3DTag, 1)
		expect(rank('frame')).toBe(0)
		expect(rank('build')).toBe(0)
		expect(rank('basics')).toBe(2)
		expect(rank('ship')).toBe(3)
		expect(rank('__goal')).toBe(1)
		expect(rank('__start')).toBe(4)
		expect(tagRank({ ...tags[0], kind: 'topic', isFocused: false, isCurrent: false }, -1)).toBe(0)
		expect(tagRank({ ...tags[0], isSelected: true, isFocused: false, isCurrent: false }, -1)).toBe(0)
	})
})

describe('resolveTagForms', () => {
	it('свободные подписи остаются полными', () => {
		const forms = resolveTagForms([entry('a', { x: 100 }), entry('b', { x: 400, order: 1 })])
		expect([...forms]).toEqual([
			['a', 'full'],
			['b', 'full'],
		])
	})

	it('перекрытый этап сжимается в кружок, цель и старт скрываются, вне экрана — скрыт', () => {
		const forms = resolveTagForms([
			entry('top', { rank: 0 }),
			entry('stage', { x: 170, order: 1 }),
			entry('goal', { kind: 'goal', rank: 1, order: 2 }),
			entry('start', { kind: 'start', rank: 4, order: 3 }),
			entry('far', { x: 900, isVisible: false, order: 4 }),
		])
		expect(Object.fromEntries(forms)).toEqual({ top: 'full', stage: 'compact', goal: 'hidden', start: 'hidden', far: 'hidden' })
	})

	it('главные подписи не сжимаются, даже если пересекаются; порядок — по важности, потом по номеру', () => {
		const forms = resolveTagForms([
			entry('b', { rank: 3, order: 1, x: 170 }),
			entry('a', { rank: 0, order: 5 }),
			entry('c', { rank: 0, order: 6 }),
		])
		expect(Object.fromEntries(forms)).toEqual({ a: 'full', c: 'full', b: 'compact' })
	})

	it('кружок занимает место: подпись, чей кружок упёрся бы в него, скрывается, а далёкая остаётся полной', () => {
		const forms = resolveTagForms([
			entry('top', { rank: 0, x: 100 }),
			entry('near', { x: 170, order: 1 }),
			entry('beside', { x: 176, order: 2 }),
			entry('away', { x: 600, order: 3 }),
		])
		expect(Object.fromEntries(forms)).toEqual({ top: 'full', near: 'compact', beside: 'hidden', away: 'full' })
	})
})

function layer(tags: Roadmap3DTag[], width: (id: string, isCompact: boolean) => number): HTMLElement {
	const host = document.createElement('div')
	tags.forEach(tag => {
		const element = document.createElement('div')
		element.setAttribute('data-label-id', tag.id)
		Object.defineProperty(element, 'offsetWidth', { get: () => width(tag.id, element.classList.contains(ROADMAP_3D_COMPACT_CLASS)) })
		Object.defineProperty(element, 'offsetHeight', { get: () => 30 })
		host.append(element)
	})
	return host
}

const spot = (x: number, y: number, isVisible = true): Scene3DLabelSpot => ({ x, y, isVisible }) as Scene3DLabelSpot

describe('layoutTags', () => {
	it('замеряет подписи в двух видах, сжимает перекрытые этапы и красит видимость', () => {
		const { snapshot } = mountSnapshot()
		const tags = buildTags(snapshot.value, IDLE, null)
		const host = layer(tags, (_id, isCompact) => (isCompact ? 24 : 120))
		const spots = new Map<string, Scene3DLabelSpot>([
			['basics', spot(200, 100)],
			['frame', spot(110, 100)],
			['build', spot(500, 300)],
			['ship', spot(900, 300, false)],
			['__start', spot(100, 100)],
		])
		layoutTags(host, tags, spots)
		const el = (id: string) => host.querySelector(`[data-label-id="${id}"]`) as HTMLElement
		expect(el('frame').classList.contains(ROADMAP_3D_COMPACT_CLASS)).toBe(false)
		expect(el('basics').classList.contains(ROADMAP_3D_COMPACT_CLASS)).toBe(true)
		expect(el('build').classList.contains(ROADMAP_3D_COMPACT_CLASS)).toBe(false)
		expect(el('ship').style.visibility).toBe('hidden')
		expect(el('__start').style.visibility).toBe('hidden')
		expect(el('basics').style.visibility).toBe('visible')
		expect(el('__goal').style.visibility).toBe('')
	})

	it('без слоя и без подписей в слое ничего не делает', () => {
		const { snapshot } = mountSnapshot()
		const tags = buildTags(snapshot.value, IDLE, null)
		expect(() => layoutTags(null, tags, new Map())).not.toThrow()
		expect(() => layoutTags(document.createElement('div'), tags, new Map([['basics', spot(1, 1)]]))).not.toThrow()
	})

	it('без текущего этапа соседей нет; перекрытые подписи скрываются', () => {
		const { snapshot } = mountSnapshot()
		const tags = buildTags(snapshot.value, IDLE, null).map(tag => ({ ...tag, isCurrent: false }))
		const host = layer(tags, () => 50)
		layoutTags(host, tags, new Map(tags.map(tag => [tag.id, spot(100, 100)])))
		expect(
			[...host.querySelectorAll<HTMLElement>('[data-label-id]')].filter(item => item.style.visibility === 'hidden').length,
		).toBeGreaterThan(0)
	})
})
