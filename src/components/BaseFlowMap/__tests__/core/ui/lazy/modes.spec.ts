import '@testing-library/jest-dom/vitest'
import { waitFor } from '@testing-library/vue'
import { mountMap, stubFrame } from '../flowUi'

const loads = vi.hoisted(() => ({ edit: 0, review: 0 }))

vi.mock('../../../../model/edit/useFlowEditing', async importOriginal => {
	loads.edit += 1
	return importOriginal()
})
vi.mock('../../../../model/review/useFlowReview', async importOriginal => {
	loads.review += 1
	return importOriginal()
})

const PALETTE = '.base-flow-map__edit-palette'
const TOOLBAR = '.base-flow-map__edit-bar'
const STATUS = '.base-flow-map__edit-status'
const INSPECTOR = '.base-flow-map__edit-inspector'
const STAGE_EDIT = '.base-flow-map__stage--edit'
const REVIEW_PANEL = '.base-flow-map__review-panel'
const REVIEW_OVERLAY = '.base-flow-map__review'
const OPEN_SUGGESTION = {
	id: 's1',
	author: { name: 'Анна' },
	date: 1,
	changes: [{ type: 'update', entity: 'node', id: 'a', patch: { label: 'Альфа' }, previous: { label: 'Alpha' } }],
	status: 'open',
} as never
const idle = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

beforeEach(() => stubFrame(1200))

describe('карта: код «Правки» и «Правок» не грузится без нужды', () => {
	it('в просмотре с пустыми suggestions и comments import() «Правок» не вызывается, даже в простое', async () => {
		const { container } = mountMap({ suggestions: [], comments: [] })
		await idle()
		expect(loads.review).toBe(0)
		expect(loads.edit).toBe(0)
		expect(container.querySelector(REVIEW_PANEL)).toBeNull()
		expect(container.querySelector(PALETTE)).toBeNull()
	})

	it('непустые suggestions загружают «Правки», но в просмотре панель и оверлей не показываются', async () => {
		const { container } = mountMap({ suggestions: [OPEN_SUGGESTION] })
		await waitFor(() => expect(container.querySelector('.base-flow-map__review-layer')).not.toBeNull())
		expect(loads.review).toBeGreaterThan(0)
		expect(container.querySelector(REVIEW_PANEL)).toBeNull()
		expect(container.querySelector(REVIEW_OVERLAY)).toBeNull()
	})
})

describe('карта: атомарное включение режима', () => {
	it('«Правка»: до загрузки — просмотр, после — палитра, панель инструментов, строка состояния, инспектор и класс сцены разом', async () => {
		const { container } = mountMap({ mode: 'edit' })
		expect(container.querySelector(PALETTE)).toBeNull()
		expect(container.querySelector(TOOLBAR)).toBeNull()
		expect(container.querySelector(STAGE_EDIT)).toBeNull()
		expect(container.querySelector('.base-flow-map__minimap')).not.toBeNull()
		await waitFor(() => expect(container.querySelector(PALETTE)).not.toBeNull(), { timeout: 15000 })
		await waitFor(() => expect(container.querySelector(STAGE_EDIT)).not.toBeNull())
		expect(container.querySelector(TOOLBAR)).not.toBeNull()
		expect(container.querySelector(STATUS)).not.toBeNull()
		await waitFor(() => expect(container.querySelector(INSPECTOR)).not.toBeNull())
		expect(container.querySelector('.base-flow-map__minimap')).toBeNull()
	})

	it('«Правки»: до загрузки — просмотр, после — панель и оверлей', async () => {
		const { container } = mountMap({ mode: 'review', currentUser: { name: 'Анна' } })
		expect(container.querySelector(REVIEW_PANEL)).toBeNull()
		await waitFor(() => expect(container.querySelector(REVIEW_PANEL)).not.toBeNull(), { timeout: 15000 })
		await waitFor(() => expect(container.querySelector(REVIEW_OVERLAY)).not.toBeNull())
		expect(container.querySelector(PALETTE)).toBeNull()
	})

	it('переключение с просмотра на «Правку» по пропу включает правку целиком', async () => {
		const { container, rerender } = mountMap({ modes: ['view', 'edit'] })
		await idle()
		expect(container.querySelector(PALETTE)).toBeNull()
		await rerender({ mode: 'edit' })
		await waitFor(() => expect(container.querySelector(PALETTE)).not.toBeNull())
		expect(container.querySelector(STAGE_EDIT)).not.toBeNull()
		await rerender({ mode: 'view' })
		await waitFor(() => expect(container.querySelector(STAGE_EDIT)).toBeNull())
	})
})

describe('карта: переход между режимами', () => {
	it('из «Правки» в «Правки» слой правки остаётся активным, но рисует только своё без портов', async () => {
		const { container, rerender } = mountMap({ mode: 'edit', modes: ['view', 'edit', 'review'], currentUser: { name: 'Анна' } })
		await waitFor(() => expect(container.querySelector(PALETTE)).not.toBeNull(), { timeout: 15000 })
		await rerender({ mode: 'review' })
		await waitFor(() => expect(container.querySelector(REVIEW_PANEL)).not.toBeNull(), { timeout: 15000 })
		await waitFor(() => expect(container.querySelector('.base-flow-map__edit-svg')).not.toBeNull())
		expect(container.querySelector(STAGE_EDIT)).toBeNull()
		expect(container.querySelector('.base-flow-map__edit-port')).toBeNull()
	})
})

describe('карта: поиск и подробности', () => {
	it('полоса поиска занимает место сразу, поле появляется в ней же после загрузки', async () => {
		const { container } = mountMap({ panels: ['search'] })
		const bar = container.querySelector('.base-flow-map__bar') as HTMLElement
		expect(bar).not.toBeNull()
		expect(bar.querySelector('input')).toBeNull()
		await waitFor(() => expect(bar.querySelector('input')).not.toBeNull())
		expect(container.querySelector('.base-flow-map__bar')).toBe(bar)
	})
})
