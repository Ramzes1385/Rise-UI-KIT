import { vi } from 'vitest'
import type { PropType } from 'vue'
import { mount } from '@vue/test-utils'
import { UI_ROADMAP } from '@/locales/messages'
import { editData } from '../fixtures/editFixtures'
import { defineComponent, h, shallowRef } from 'vue'
import type { RoadmapMode } from '../../../types/BaseRoadmap.types'
import type { RoadmapData } from '../../../types/roadmapData.types'
import { useRoadmapModes } from '../../../model/edit/run/useRoadmapModes'
import type { RoadmapReviewData } from '../../../types/roadmapEdit.types'
import { createRoadmapHooks } from '../../../model/edit/data/roadmapHooks'
import { useRoadmapEditing } from '../../../model/edit/run/useRoadmapEditing'

const Host = defineComponent({
	props: {
		data: { type: Object as PropType<RoadmapData>, required: true },
		mode: { type: String as PropType<RoadmapMode>, default: undefined },
		modes: { type: Array as PropType<RoadmapMode[]>, default: undefined },
		review: { type: Object as PropType<RoadmapReviewData>, default: undefined },
	},
	emits: ['update:data', 'update:mode', 'update:review', 'publish', 'reorder'],
	setup(props, { emit, expose }) {
		const data = shallowRef(props.data)
		const hooks = createRoadmapHooks(props as never)
		const state = useRoadmapEditing({ props: props as never, emit: emit as never, data, hooks })
		const modes = useRoadmapModes(props as never, emit as never, { setMode: state.setMode, data } as never)
		expose({ ctx: { state, modes, data } })
		return () => h('div')
	},
})

function mountHost(props: { data: RoadmapData; mode?: RoadmapMode; modes?: RoadmapMode[]; review?: RoadmapReviewData }) {
	const wrapper = mount(Host, { props })
	const ctx = (
		wrapper.vm as unknown as {
			ctx: { state: ReturnType<typeof useRoadmapEditing>; modes: ReturnType<typeof useRoadmapModes>; data: { value: RoadmapData } }
		}
	).ctx
	return { wrapper, ...ctx }
}

describe('useRoadmapMode', () => {
	it('режим по умолчанию — просмотр; setMode меняет режим и сообщает один раз', () => {
		const { state, wrapper } = mountHost({ data: editData() })
		expect(state.currentMode.value).toBe('view')
		expect([state.isEditing.value, state.isReviewing.value]).toEqual([false, false])
		state.setMode('edit')
		state.setMode('edit')
		expect(state.isEditing.value).toBe(true)
		expect(wrapper.emitted('update:mode')).toEqual([['edit']])
		state.setMode('review')
		expect(state.isReviewing.value).toBe(true)
	})

	it('режим из пропса подхватывается и при смене пропса', async () => {
		const { state, wrapper } = mountHost({ data: editData(), mode: 'review' })
		expect(state.isReviewing.value).toBe(true)
		await wrapper.setProps({ mode: 'edit' })
		expect(state.isEditing.value).toBe(true)
	})
})

describe('useRoadmapEditLoader: ленивая «Правка»', () => {
	it('в просмотре код правки не грузится, методы грузят его по первому вызову', async () => {
		const { state, wrapper } = mountHost({ data: editData() })
		expect(state.editor.controller.value).toBeNull()
		expect(state.editor.methods.undo()).toBe(false)
		expect(state.editor.methods.redo()).toBe(false)
		expect(await state.editor.methods.update('a', { title: 'Z' })).toBe(true)
		expect(state.editor.controller.value).not.toBeNull()
		expect(wrapper.emitted('update:data')).toHaveLength(1)
		expect(state.editor.methods.undo()).toBe(true)
		expect(state.editor.methods.redo()).toBe(true)
	})

	it('режим «Правка» грузит контроллер сразу и один раз', async () => {
		const { state } = mountHost({ data: editData(), mode: 'edit' })
		const controller = await state.editor.load()
		expect(state.editor.controller.value).toBe(controller)
		expect(await state.editor.load()).toBe(controller)
	})

	it('все методы расширения доходят до контроллера', async () => {
		const { state, data } = mountHost({ data: editData() })
		const { methods } = state.editor
		expect(await methods.addStage({ id: 'x', title: 'X', topics: [] }, 0)).toBe(true)
		expect(await methods.addTopic('x', { id: 'y', title: 'Y' }, 0)).toBe(true)
		expect(await methods.move('x', { index: 1 })).toBe(true)
		expect(await methods.addRequirement('y', 'a')).toBe(true)
		expect(await methods.removeRequirement('y', 'a')).toBe(true)
		expect(await methods.insertTemplate('topic', { stage: 'x' })).toBe(true)
		expect(await methods.transact('Пакет', () => undefined)).toBe(true)
		expect(await methods.remove(['y'])).toBe(true)
		expect(await methods.importJson(editData())).toBe(true)
		expect(JSON.parse(methods.exportJson())).toEqual(data.value)
	})
})

describe('useRoadmapReviewLoader: ленивые «Правки»', () => {
	it('в просмотре состояния нет, propose грузит его и принимает предложение', async () => {
		const { state, wrapper } = mountHost({ data: editData() })
		expect(state.reviewer.state.value).toBeNull()
		const proposal = await state.reviewer.propose(
			[{ type: 'update', entity: 'topic', id: 'a', patch: { title: 'N' }, previous: { title: 'Тема a' } }],
			'Правка',
		)
		expect(proposal).toMatchObject({ id: 'p1', label: 'Правка', status: 'open' })
		expect(state.reviewer.state.value).not.toBeNull()
		expect(wrapper.emitted('update:review')).toHaveLength(1)
	})

	it('режим «Правки» грузит состояние сразу, повторная загрузка отдаёт то же', async () => {
		const { state } = mountHost({ data: editData(), mode: 'review' })
		const review = await state.reviewer.load()
		expect(state.reviewer.state.value).toBe(review)
		expect(await state.reviewer.load()).toBe(review)
		expect(state.editor.controller.value).not.toBeNull()
	})

	it('принятие предложения проходит через историю правки', async () => {
		const { state, data } = mountHost({ data: editData(), mode: 'review' })
		await state.reviewer.propose([{ type: 'update', entity: 'topic', id: 'a', patch: { title: 'N' }, previous: { title: 'Тема a' } }])
		const review = await state.reviewer.load()
		expect(await review.accept('p1')).toBe(true)
		expect(data.value.stages[0].topics[0].title).toBe('N')
		expect(state.editor.controller.value?.history.list()).toHaveLength(1)
	})
})

describe('useRoadmapModes: переключатель в шапке', () => {
	it('без modes переключателя нет; с modes — варианты с подписями режимов', () => {
		expect(mountHost({ data: editData() }).modes.hasModes.value).toBe(false)
		const { modes } = mountHost({ data: editData(), modes: ['view', 'edit', 'review'] })
		expect(modes.hasModes.value).toBe(true)
		expect(modes.modeOptions.value).toEqual([
			{ value: 'view', label: UI_ROADMAP.MODE_VIEW },
			{ value: 'edit', label: UI_ROADMAP.MODE_EDIT },
			{ value: 'review', label: UI_ROADMAP.MODE_REVIEW },
		])
	})

	it('modeOptions без modes пусты, changeMode меняет режим, publish отдаёт данные наружу', () => {
		const { modes, state, wrapper, data } = mountHost({ data: editData() })
		expect(modes.modeOptions.value).toEqual([])
		modes.changeMode('edit')
		expect(state.isEditing.value).toBe(true)
		modes.publish()
		expect(wrapper.emitted('publish')).toEqual([[data.value]])
		vi.restoreAllMocks()
	})
})
