import { vi } from 'vitest'
import { editData } from '../fixtures/editFixtures'
import { computed, effectScope, shallowRef } from 'vue'
import { createRoadmapHooks } from '../../../model/edit/data/roadmapHooks'
import { createRoadmapEdit } from '../../../model/edit/run/useRoadmapEdit'
import { useRoadmapEditLoader } from '../../../model/edit/run/useRoadmapEditLoader'
import { useRoadmapReviewLoader } from '../../../model/review/useRoadmapReviewLoader'
import type { RoadmapEditLoader } from '../../../types/internal/roadmapEdit.internal.types'

const keep = effectScope()
afterAll(() => keep.stop())

function context() {
	const props = { data: editData(), review: { currentUser: { name: 'Роман' } } }
	const hooks = keep.run(() => createRoadmapHooks(props as never))
	return { props, emit: vi.fn(), data: shallowRef(props.data), hooks } as never
}

describe('загрузчики вне активной области и в остановленной', () => {
	it('«Правка» вне области создаёт контроллер напрямую', async () => {
		const loader = useRoadmapEditLoader(
			context(),
			computed(() => false),
		)
		const controller = await loader.load()
		expect(loader.controller.value).toBe(controller)
		expect(await loader.methods.update('a', { title: 'Z' })).toBe(true)
	})

	it('«Правка» в остановленной области ничего не запускает, контроллера нет', async () => {
		const scope = effectScope()
		const loader = scope.run(() =>
			useRoadmapEditLoader(
				context(),
				computed(() => true),
			),
		)!
		scope.stop()
		expect(await loader.load()).toBeNull()
		expect(loader.controller.value).toBeNull()
	})

	it('«Правки» вне области создают состояние напрямую', async () => {
		const ctx = context()
		const editor: RoadmapEditLoader = {
			controller: shallowRef(null),
			load: () => Promise.resolve(createRoadmapEdit(ctx)),
			methods: {} as never,
		}
		const loader = useRoadmapReviewLoader(
			ctx,
			editor,
			computed(() => false),
		)
		const state = await loader.load()
		expect(loader.state.value).toBe(state)
		expect(state.currentUser.value).toEqual({ name: 'Роман' })
	})

	it('«Правки» в остановленной области состояния не создают', async () => {
		const ctx = context()
		const alive = effectScope()
		const edit = alive.run(() => createRoadmapEdit(ctx))!
		const editor = { controller: shallowRef(null), load: () => Promise.resolve(edit), methods: {} } as never
		const scope = effectScope()
		const loader = scope.run(() =>
			useRoadmapReviewLoader(
				ctx,
				editor,
				computed(() => true),
			),
		)!
		scope.stop()
		expect(await loader.load()).toBeNull()
		expect(loader.state.value).toBeNull()
		alive.stop()
	})
})
