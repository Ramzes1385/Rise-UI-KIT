import { Vector3 } from 'three'
import { mountSnapshot } from '../../fixtures/model.test-utils'
import type { Roadmap3DStates } from '../../../types/internal/roadmap3dInternal.types'
import { ROADMAP_3D_GOAL, ROADMAP_3D_START, buildLabelSet, buildTags } from '../../../model/data/roadmap3dTags'

const IDLE: Roadmap3DStates = { hover: null, focus: null, selected: null, currentId: null }

describe('buildTags', () => {
	it('этапы, затем старт и цель; у закрытого мета «закрыт», у остальных проценты', () => {
		const { snapshot } = mountSnapshot()
		const tags = buildTags(snapshot.value, IDLE, null)
		expect(tags.map(tag => tag.id)).toEqual(['basics', 'frame', 'build', 'ship', ROADMAP_3D_START, ROADMAP_3D_GOAL])
		expect(tags[0].meta).toContain('100')
		expect(tags[2].meta).toBe('закрыт')
		expect(tags[1]).toMatchObject({ kind: 'stage', isCurrent: true, isFocused: false, isDim: false, color: '#ff8800', index: 1 })
		expect(tags[4]).toMatchObject({ kind: 'start', text: 'Старт', index: -1, color: '', isDim: false })
		expect(tags[5].kind).toBe('goal')
		expect(tags[5].text).toContain('Работа')
	})

	it('в фокусе: остальные притушены, темы этапа добавлены, выбранное помечено', () => {
		const { snapshot } = mountSnapshot()
		const tags = buildTags(snapshot.value, { ...IDLE, focus: 'frame', selected: 'react' }, null)
		const topics = tags.filter(tag => tag.kind === 'topic')
		expect(topics.map(tag => tag.id)).toEqual(['vue', 'react', 'svelte'])
		expect(topics.find(tag => tag.id === 'react')?.isSelected).toBe(true)
		expect(topics[0]).toMatchObject({ color: '#ff8800', meta: '', isFocused: false })
		const stages = tags.filter(tag => tag.kind === 'stage')
		expect(stages.map(tag => tag.isDim)).toEqual([true, false, true, true])
		expect(stages[1].isFocused).toBe(true)
	})

	it('курсор клавиатуры помечает этап сфокусированным без фокуса', () => {
		const { snapshot } = mountSnapshot()
		const tags = buildTags(snapshot.value, { ...IDLE, selected: 'basics' }, 'build')
		expect(tags.find(tag => tag.id === 'build')?.isFocused).toBe(true)
		expect(tags.find(tag => tag.id === 'basics')?.isSelected).toBe(true)
	})

	it('без цели нет метки цели; без этапов нет ни старта, ни цели', () => {
		const { snapshot } = mountSnapshot({ version: 1, title: 'Без цели', stages: [{ id: 'a', title: 'A', topics: [] }] }, undefined)
		expect(buildTags(snapshot.value, IDLE, null).map(tag => tag.kind)).toEqual(['stage', 'start'])
		const empty = mountSnapshot({ version: 1, title: 'Пусто', stages: [] }, undefined)
		expect(buildTags(empty.snapshot.value, IDLE, null)).toEqual([])
	})
})

describe('buildLabelSet', () => {
	it('приоритеты: выбранное, фокус, текущий, обычный, края; без якоря метки нет', () => {
		const { snapshot } = mountSnapshot()
		const tags = buildTags(snapshot.value, { ...IDLE, focus: 'frame', selected: 'vue' }, null)
		const anchors = new Map(tags.filter(tag => tag.id !== 'svelte').map(tag => [tag.id, new Vector3()]))
		const { items } = buildLabelSet(tags, anchors)
		const byId = new Map(items.map(item => [item.id, item]))
		expect(byId.has('svelte')).toBe(false)
		expect(byId.get('vue')).toMatchObject({ priority: 5, isPinned: true })
		expect(byId.get('react')).toMatchObject({ priority: 2, isPinned: true })
		expect(byId.get('frame')).toMatchObject({ priority: 4, isPinned: true })
		expect(byId.get('basics')?.priority).toBe(2)
		expect(byId.get(ROADMAP_3D_START)?.priority).toBe(1)
		expect(byId.get(ROADMAP_3D_GOAL)?.priority).toBe(1)
	})

	it('текущий этап выше обычного, но ниже фокуса', () => {
		const { snapshot } = mountSnapshot()
		const tags = buildTags(snapshot.value, IDLE, null)
		const anchors = new Map(tags.map(tag => [tag.id, new Vector3()]))
		const { items, tags: same } = buildLabelSet(tags, anchors)
		expect(same).toBe(tags)
		expect(items.find(item => item.id === 'frame')?.priority).toBe(3)
	})
})
