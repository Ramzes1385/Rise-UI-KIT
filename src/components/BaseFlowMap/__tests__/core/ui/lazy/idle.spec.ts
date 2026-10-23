import '@testing-library/jest-dom/vitest'
import { mountMap, stubFrame } from '../flowUi'
import { fireEvent, screen } from '@testing-library/vue'

const spies = vi.hoisted(() => ({ edit: vi.fn(), review: vi.fn(), details: vi.fn() }))

vi.mock('../../../../ui/lazy/flowLazyLoaders', async importOriginal => {
	const original = await importOriginal<typeof import('../../../../ui/lazy/flowLazyLoaders')>()
	return {
		...original,
		loadEditUi: () => (spies.edit(), original.loadEditUi()),
		loadReviewUi: () => (spies.review(), original.loadReviewUi()),
		loadDetails: () => (spies.details(), original.loadDetails()),
	}
})

const idle = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))
const LOAD = { timeout: 15000 }

beforeEach(() => {
	stubFrame(1200)
	spies.edit.mockClear()
	spies.review.mockClear()
	spies.details.mockClear()
})

describe('карта: загрузка в простое', () => {
	it('без панели подробностей и без modes ничего не скачивается: ни подробности, ни правка, ни правки', async () => {
		mountMap({ panels: ['legend'] })
		await idle()
		expect(spies.edit).not.toHaveBeenCalled()
		expect(spies.review).not.toHaveBeenCalled()
		expect(spies.details).not.toHaveBeenCalled()
	})

	it('modes с edit и review скачивают код заранее, а вид остаётся просмотром', async () => {
		const { container } = mountMap({ modes: ['view', 'edit', 'review'], currentUser: { name: 'Анна' } })
		await vi.waitFor(() => expect(spies.edit).toHaveBeenCalledTimes(1), LOAD)
		await vi.waitFor(() => expect(spies.review).toHaveBeenCalledTimes(1), LOAD)
		await idle()
		expect(container.querySelector('.base-flow-map__edit-palette')).toBeNull()
		expect(container.querySelector('.base-flow-map__review-panel')).toBeNull()
		expect(container.querySelector('.base-flow-map__stage--edit')).toBeNull()
	})

	it('modes только с edit скачивают одну «Правку»', async () => {
		mountMap({ modes: ['view', 'edit'] })
		await vi.waitFor(() => expect(spies.edit).toHaveBeenCalledTimes(1), LOAD)
		await idle()
		expect(spies.review).not.toHaveBeenCalled()
	})

	it('modes только с review скачивают одни «Правки»', async () => {
		mountMap({ modes: ['view', 'review'], currentUser: { name: 'Анна' } })
		await vi.waitFor(() => expect(spies.review).toHaveBeenCalledTimes(1), LOAD)
		await idle()
		expect(spies.edit).not.toHaveBeenCalled()
	})

	it('подробности подгружаются в простое и открываются по выбору узла', async () => {
		mountMap({ panels: ['details'] })
		await vi.waitFor(() => expect(spies.details).toHaveBeenCalled(), LOAD)
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		expect(await screen.findByRole('region', { name: /Подробности/ })).toBeInTheDocument()
	})
})
