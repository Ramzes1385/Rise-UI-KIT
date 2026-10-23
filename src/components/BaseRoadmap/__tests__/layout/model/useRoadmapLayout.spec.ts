import { mount } from '@vue/test-utils'
import { UI_ROADMAP } from '@/locales/messages'
import { defineComponent, h, nextTick } from 'vue'
import { useRoadmapLayout } from '../../../model/layout/useRoadmapLayout'
import { manyStages, topicView, stageView, ui } from '../fixtures/viewFixtures'
import type { RoadmapCanvasProps } from '../../../types/internal/roadmapLayout.types'

const Harness = defineComponent({
	props: { stages: { type: Array, required: true }, progress: { type: Number, required: true }, kind: { type: String, required: true } },
	setup(props, { expose }) {
		const layout = useRoadmapLayout(props as unknown as RoadmapCanvasProps)
		expose(layout)
		return () => h('div', { ref: layout.rootRef })
	},
})

function mountLayout(props: Partial<RoadmapCanvasProps> = {}) {
	return mount(Harness, {
		attachTo: document.body,
		props: { stages: manyStages({ count: 3, topics: 2 }), progress: 0, kind: 'path', ui, ...props } as never,
	})
}

interface Exposed {
	geometry: {
		width: number
		height: number
		stages: unknown[]
		spine: string
		fractions: number[]
		start: { x: number; y: number }
		goal: { x: number; y: number }
	}
	items: { topics: unknown[] }[]
	links: string[]
	solid: number
	canvasStyle: Record<string, number>
	viewBox: string
	startStyle: Record<string, number>
	goalStyle: Record<string, number>
	startText: string
}

function exposed(wrapper: ReturnType<typeof mountLayout>): Exposed {
	return wrapper.vm as unknown as Exposed
}

afterEach(() => {
	document.documentElement.removeAttribute('dir')
	document.body.innerHTML = ''
})

describe('useRoadmapLayout', () => {
	it.each([
		{ kind: 'path', width: 816 },
		{ kind: 'snake', width: 956 },
		{ kind: 'horizontal', width: 128 + 4 * 276 },
	])('kind $kind считает геометрию своей раскладки: ширина $width', ({ kind, width }) => {
		const wrapper = mountLayout({ kind } as never)
		expect(exposed(wrapper).geometry.width).toBe(width)
		expect(exposed(wrapper).geometry.stages).toHaveLength(3)
		wrapper.unmount()
	})

	it('пересчитывает геометрию при смене kind', async () => {
		const wrapper = mountLayout()
		expect(exposed(wrapper).geometry.width).toBe(816)
		await wrapper.setProps({ kind: 'snake' })
		expect(exposed(wrapper).geometry.width).toBe(956)
		wrapper.unmount()
	})

	it('пересчитывает геометрию при смене этапов и раскрытия', async () => {
		const wrapper = mountLayout({ kind: 'snake', stages: manyStages({ count: 6, topics: 7 }) } as never)
		const before = exposed(wrapper).geometry.height
		await wrapper.setProps({ stages: manyStages({ count: 6, topics: 7, expanded: [0] }) })
		expect(exposed(wrapper).geometry.height).toBeGreaterThan(before)
		await wrapper.setProps({ stages: manyStages({ count: 12, topics: 1 }) })
		expect(exposed(wrapper).geometry.stages).toHaveLength(12)
		wrapper.unmount()
	})

	it('зеркалит пути при dir="rtl" на html и возвращает при ltr', async () => {
		const wrapper = mountLayout()
		const ltr = exposed(wrapper).geometry.spine
		document.documentElement.setAttribute('dir', 'rtl')
		await new Promise(resolve => setTimeout(resolve, 0))
		await nextTick()
		const rtl = exposed(wrapper).geometry.spine
		expect(rtl).not.toBe(ltr)
		expect(rtl.startsWith('M')).toBe(true)
		document.documentElement.setAttribute('dir', 'ltr')
		await new Promise(resolve => setTimeout(resolve, 0))
		await nextTick()
		expect(exposed(wrapper).geometry.spine).toBe(ltr)
		wrapper.unmount()
	})

	it('solid берётся из props.progress по долям хребта', async () => {
		const wrapper = mountLayout()
		const { fractions } = exposed(wrapper).geometry
		expect(exposed(wrapper).solid).toBeCloseTo(fractions[0], 3)
		await wrapper.setProps({ progress: 1 })
		expect(exposed(wrapper).solid).toBe(1)
		await wrapper.setProps({ progress: 0.5 })
		expect(exposed(wrapper).solid).toBeCloseTo((fractions[1] + fractions[2]) / 2, 3)
		wrapper.unmount()
	})

	it('viewBox, стили холста, начала и цели следуют геометрии', () => {
		const wrapper = mountLayout()
		const { geometry, viewBox, canvasStyle, startStyle, goalStyle } = exposed(wrapper)
		expect(viewBox).toBe(`0 0 ${geometry.width} ${geometry.height}`)
		expect(canvasStyle).toEqual({ '--rl-width': geometry.width, '--rl-height': geometry.height })
		expect(startStyle).toEqual({ '--rl-x': geometry.start.x, '--rl-y': geometry.start.y })
		expect(goalStyle).toEqual({ '--rl-x': geometry.goal.x, '--rl-y': geometry.goal.y })
		wrapper.unmount()
	})

	it('startText — подпись «Старт» из словаря', () => {
		const wrapper = mountLayout()
		expect(exposed(wrapper).startText).toBe(UI_ROADMAP.START)
		wrapper.unmount()
	})

	it('items — этапы с темами только у раскрытых', () => {
		const wrapper = mountLayout({ stages: manyStages({ count: 3, topics: 2, expanded: [1] }) } as never)
		expect(exposed(wrapper).items.map(item => item.topics.length)).toEqual([0, 2, 0])
		wrapper.unmount()
	})

	it('links — пути связей «нужно знать» выбранной темы', () => {
		const stages = [
			stageView({
				id: 'a',
				index: 0,
				isExpanded: true,
				topics: [topicView({ id: 'a1' }), topicView({ id: 'a2', isSelected: true, topic: { requires: ['a1'] } })],
			}),
		]
		const wrapper = mountLayout({ stages } as never)
		expect(exposed(wrapper).links).toHaveLength(1)
		expect(exposed(wrapper).links[0].startsWith('M')).toBe(true)
		wrapper.unmount()
	})

	it('links пусты без выбранной темы', () => {
		const wrapper = mountLayout()
		expect(exposed(wrapper).links).toEqual([])
		wrapper.unmount()
	})
})
