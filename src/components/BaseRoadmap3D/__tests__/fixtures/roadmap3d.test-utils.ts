import type { VNode } from 'vue'
import { afterEach, expect, vi } from 'vitest'
import BaseRoadmap3D from '../../ui/BaseRoadmap3D.vue'
import { render, waitFor } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { BaseRoadmap3DExpose } from '../../types/BaseRoadmap3D.types'
import type { RoadmapData, RoadmapProgress } from '@components/BaseRoadmap/types/roadmapData.types'
import { createFakeRenderer, useMapEnvironment } from '../../../BaseImageMap3D/__tests__/imageMap3d.test-utils'

export { createFakeRenderer }
export const DATA_ROADMAP_3D: RoadmapData = {
	version: 1,
	id: 'road3d-test',
	title: 'Путь',
	goal: 'Работа',
	description: 'Тестовый путь',
	stages: [
		{
			id: 'basics',
			title: 'Основы',
			topics: [
				{ id: 'html', title: 'HTML', hours: 4, tags: ['web'] },
				{ id: 'css', title: 'CSS', hours: 6, tags: ['web', 'style'] },
			],
		},
		{
			id: 'frame',
			title: 'Каркас',
			topics: [
				{
					id: 'vue',
					title: 'Vue',
					hours: 8,
					subtopics: [
						{ id: 'vue-1', title: 'Шаблоны' },
						{ id: 'vue-2', title: 'Реактивность' },
					],
				},
				{ id: 'react', title: 'React', hours: 8, choice: 'fw' },
				{ id: 'svelte', title: 'Svelte', choice: 'fw', kind: 'optional' },
			],
			model3d: { model: 'book', tint: '#ff8800' },
		},
		{ id: 'build', title: 'Сборка', requires: ['frame'], topics: [{ id: 'vite', title: 'Vite' }] },
		{ id: 'ship', title: 'Релиз', topics: [] },
	],
}

export const PROGRESS_ROADMAP_3D: RoadmapProgress = {
	version: 1,
	topics: { html: { status: 'done' }, css: { status: 'done' }, vue: { subtopics: ['vue-1'] } },
}
export function stagesData(count: number, patch: Partial<RoadmapData> = {}): RoadmapData {
	return {
		version: 1,
		id: `many-${count}`,
		title: `Много ${count}`,
		stages: Array.from({ length: count }, (_, index) => ({
			id: `s${index + 1}`,
			title: `Этап ${index + 1}`,
			topics: [{ id: `t${index + 1}`, title: `Тема ${index + 1}` }],
		})),
		...patch,
	}
}

export function stubReducedMotion(isReduced: boolean): void {
	vi.stubGlobal('matchMedia', (query: string) => ({
		matches: isReduced,
		media: query,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	}))
}

const EVENTS = [
	'update:view',
	'update:camera',
	'update:focused',
	'update:isTourPlaying',
	'fallback',
	'update:progress',
	'update:data',
	'update:selected',
	'update:mode',
	'status-change',
	'reorder',
]

type Slots = Record<string, () => VNode>
type RenderOptions = { isReady?: boolean; renderer?: ReturnType<typeof createFakeRenderer> }

function eventListeners(events: Record<string, unknown[][]>) {
	return Object.fromEntries(
		EVENTS.map(name => [
			`on${name.charAt(0).toUpperCase()}${name.slice(1).replace(/-(.)/g, (_, letter: string) => letter.toUpperCase())}`,
			(...args: unknown[]) => (events[name] ??= []).push(args),
		]),
	)
}

async function mountRoadmap(flush: () => void, setup: { props: Record<string, unknown>; slots: Slots; options: RenderOptions }) {
	const { props, slots, options } = setup
	const renderer = options.renderer ?? createFakeRenderer()
	const exposed = ref<BaseRoadmap3DExpose | null>(null)
	const factory = vi.fn(() => renderer)
	const events: Record<string, unknown[][]> = {}
	const listeners = eventListeners(events)
	const defaults = { data: DATA_ROADMAP_3D, progress: PROGRESS_ROADMAP_3D, rendererFactory: factory }
	const Host = defineComponent({
		setup:
			(_, { attrs }) =>
			() =>
				h(BaseRoadmap3D, { ...defaults, ...listeners, ...attrs, ref: exposed }, slots),
	})
	const result = render(Host, { attrs: props })
	const isReady = options.isReady ?? (props.view !== '2d' && !props.rendererFactory)
	if (isReady) await waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalled())
	await nextTick()
	flush()
	await nextTick()
	return { ...result, renderer, factory, exposed, events }
}

export function useRoadmap3DEnvironment() {
	const env = useMapEnvironment()
	let now = 0

	afterEach(async () => {
		await vi.dynamicImportSettled()
	})

	function flush(frames = 1): void {
		for (let index = 0; index < frames; index++) {
			now += 16
			const callbacks = vi.mocked(requestAnimationFrame).mock.calls.splice(0)
			callbacks.forEach(([callback]) => callback(now))
		}
	}

	return {
		...env,
		flush,
		renderRoadmap: (props: Record<string, unknown> = {}, slots: Slots = {}, options: RenderOptions = {}) =>
			mountRoadmap(flush, { props, slots, options }),
	}
}
