import { vi } from 'vitest'
import { editData } from '../fixtures/editFixtures'
import userEvent from '@testing-library/user-event'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { screen, within } from '@testing-library/vue'
import { LOAD_TIMEOUT } from '../fixtures/renderEditor'
import { computed, effectScope, shallowRef } from 'vue'
import { mockWidth } from '../../fixtures/shellFixtures'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { createRoadmapHooks } from '../../../model/edit/data/roadmapHooks'
import { useRoadmapEditLoader } from '../../../model/edit/run/useRoadmapEditLoader'
import { UI_ROADMAP, UI_ROADMAP_EDIT, UI_ROADMAP_REVIEW } from '@/locales/messages'
import { useRoadmapReviewLoader } from '../../../model/review/useRoadmapReviewLoader'

const failing = vi.hoisted(() => ({ edit: false, review: false }))

vi.mock('../../../model/edit/run/useRoadmapEdit', async importOriginal => {
	const original = await importOriginal<object>()
	return {
		...original,
		get createRoadmapEdit() {
			if (failing.edit) throw new Error('чанк правки не загрузился')
			return (original as { createRoadmapEdit: unknown }).createRoadmapEdit
		},
	}
})
vi.mock('../../../model/review/useRoadmapReview', async importOriginal => {
	const original = await importOriginal<object>()
	return {
		...original,
		get useRoadmapReview() {
			if (failing.review) throw new Error('чанк правок не загрузился')
			return (original as { useRoadmapReview: unknown }).useRoadmapReview
		},
	}
})

vi.setConfig({ testTimeout: 60_000 })
enableAutoUnmount(afterEach)

const keep = effectScope()
afterAll(() => keep.stop())

let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => {
	failing.edit = false
	failing.review = false
	warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})
afterEach(() => vi.restoreAllMocks())

function context() {
	const props = { data: editData(), review: { currentUser: { name: 'Роман' } } }
	const hooks = keep.run(() => createRoadmapHooks(props as never))
	return { props, emit: vi.fn(), data: shallowRef(props.data), hooks } as never
}

describe('загрузчики: сбой чанка и повтор', () => {
	it('«Правка»: сбой — error, ожидание сброшено, warn; retry грузит, error снимается', async () => {
		failing.edit = true
		const loader = useRoadmapEditLoader(
			context(),
			computed(() => false),
		)
		await expect(loader.load()).rejects.toThrow('чанк правки')
		expect(loader.error.value).toBe(true)
		expect(loader.controller.value).toBeNull()
		expect(warn).toHaveBeenCalledOnce()
		expect(String(warn.mock.calls[0][0])).toContain('edit')
		failing.edit = false
		loader.retry()
		await vi.waitFor(() => expect(loader.controller.value).not.toBeNull())
		expect(loader.error.value).toBe(false)
		expect(warn).toHaveBeenCalledOnce()
	})

	it('«Правка» в режиме edit: сбой при включении не даёт необработанного отказа', async () => {
		failing.edit = true
		const loader = useRoadmapEditLoader(
			context(),
			computed(() => true),
		)
		await vi.waitFor(() => expect(loader.error.value).toBe(true))
		failing.edit = false
		loader.retry()
		await vi.waitFor(() => expect(loader.controller.value).not.toBeNull())
		expect(loader.error.value).toBe(false)
	})

	it('«Правки»: сбой — error, warn; retry создаёт состояние, error снимается', async () => {
		const ctx = context()
		const editor = useRoadmapEditLoader(
			ctx,
			computed(() => false),
		)
		failing.review = true
		const loader = useRoadmapReviewLoader(
			ctx,
			editor,
			computed(() => false),
		)
		await expect(loader.load()).rejects.toThrow('чанк правок')
		expect(loader.error.value).toBe(true)
		expect(loader.state.value).toBeNull()
		expect(warn).toHaveBeenCalledOnce()
		expect(String(warn.mock.calls[0][0])).toContain('review')
		failing.review = false
		loader.retry()
		await vi.waitFor(() => expect(loader.state.value).not.toBeNull())
		expect(loader.error.value).toBe(false)
	})

	it('«Правки» в режиме review: сбой при включении ловится, повтор работает', async () => {
		const ctx = context()
		const editor = useRoadmapEditLoader(
			ctx,
			computed(() => false),
		)
		failing.review = true
		const loader = useRoadmapReviewLoader(
			ctx,
			editor,
			computed(() => true),
		)
		await vi.waitFor(() => expect(loader.error.value).toBe(true))
		failing.review = false
		loader.retry()
		await vi.waitFor(() => expect(loader.state.value).not.toBeNull())
		expect(loader.error.value).toBe(false)
	})
})

function mountMode(mode: 'edit' | 'review') {
	mockWidth(1200)
	const user = userEvent.setup()
	mount(BaseRoadmap, {
		props: { data: editData(), mode, layout: 'list', review: { currentUser: { name: 'Роман' } } } as never,
		attachTo: document.body,
	})
	return user
}

describe('BaseRoadmap: RoadmapLoadError', () => {
	it('режим edit: сбой — сообщение и «Повторить», повтор открывает редактор', async () => {
		failing.edit = true
		const user = mountMode('edit')
		const alert = await screen.findByRole('alert', {}, { timeout: LOAD_TIMEOUT })
		expect(within(alert).getByText(UI_ROADMAP.LOAD_ERROR)).toBeInTheDocument()
		expect(screen.queryByRole('group', { name: UI_ROADMAP.LOADING })).not.toBeInTheDocument()
		failing.edit = false
		await user.click(within(alert).getByRole('button', { name: UI_ROADMAP.LOAD_RETRY }))
		expect(await screen.findByLabelText(UI_ROADMAP_EDIT.AREA_LABEL, {}, { timeout: LOAD_TIMEOUT })).toBeInTheDocument()
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
	})

	it('режим review: сбой — сообщение в боковой панели, повтор открывает «Правки»', async () => {
		failing.review = true
		const user = mountMode('review')
		const alert = await screen.findByRole('alert', {}, { timeout: LOAD_TIMEOUT })
		expect(within(alert).getByText(UI_ROADMAP.LOAD_ERROR)).toBeInTheDocument()
		failing.review = false
		await user.click(within(alert).getByRole('button', { name: UI_ROADMAP.LOAD_RETRY }))
		expect(await screen.findByRole('region', { name: UI_ROADMAP_REVIEW.PANEL }, { timeout: LOAD_TIMEOUT })).toBeInTheDocument()
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
	})
})
