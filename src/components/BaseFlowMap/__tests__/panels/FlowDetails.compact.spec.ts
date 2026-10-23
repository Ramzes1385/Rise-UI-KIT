import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { nextTick } from 'vue'
import { UI_FLOW_PANELS } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import FlowDetails from '../../ui/panels/FlowDetails.vue'
import { render, screen, within } from '@testing-library/vue'
import type { FlowElementRef } from '../../types/data/flowReview.types'
import { createFakeContext, provideContext } from '../fixtures/panelsContext'

function mount(options: Parameters<typeof createFakeContext>[0] = {}) {
	const fake = createFakeContext({ isCompact: true, ...options })
	const view = render(FlowDetails, { global: provideContext(fake.context) })
	return { ...fake, ...view }
}

const node = (id: string): FlowElementRef => ({ entity: 'node', id })

async function mountAndOpen(target: FlowElementRef, options: Parameters<typeof createFakeContext>[0] = {}) {
	const mounted = mount(options)
	mounted.details.value = target
	await nextTick()
	await nextTick()
	return mounted
}

function dialog(): HTMLElement {
	return screen.getByRole('dialog', { name: UI_FLOW_PANELS.DETAILS_NODE })
}

describe('FlowDetails: лист на узком экране', () => {
	beforeEach(() => {
		vi.spyOn(window.history, 'back').mockImplementation(() => undefined)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('вместо боковой панели открывается нижний лист-диалог с содержимым', async () => {
		mount({ details: node('api') })
		await nextTick()
		const sheet = dialog()
		expect(screen.queryByRole('region')).not.toBeInTheDocument()
		expect(within(sheet).getByText('API')).toBeInTheDocument()
		expect(within(sheet).getByText('Принимает заказы')).toBeInTheDocument()
		expect(within(sheet).queryByRole('button', { name: UI_FLOW_PANELS.DETAILS_CLOSE })).not.toBeInTheDocument()
	})

	it('лист закрыт, пока ничего не выбрано', async () => {
		mount()
		await nextTick()
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('кнопка закрытия листа закрывает подробности', async () => {
		const { openDetails, details } = mount({ details: node('api') })
		await nextTick()
		const user = userEvent.setup()
		await user.click(within(dialog()).getAllByRole('button')[0]!)
		expect(openDetails).toHaveBeenCalledWith(null)
		expect(details.value).toBeNull()
	})

	it('Escape закрывает лист', async () => {
		const { openDetails } = mount({ details: node('api') })
		await nextTick()
		const user = userEvent.setup()
		await user.keyboard('{Escape}')
		expect(openDetails).toHaveBeenCalledWith(null)
	})

	it('при открытии листа вид сдвигается, чтобы узел остался над ним, — с анимацией и прежним масштабом', async () => {
		const { setViewport } = await mountAndOpen(node('api'), { viewport: { x: 0, y: 0, zoom: 2 }, frame: { width: 400, height: 800 } })
		expect(setViewport).toHaveBeenCalledTimes(1)
		expect(setViewport).toHaveBeenCalledWith({ zoom: 2, x: 200 - 80 * 2, y: 160 - 28 * 2 }, { isAnimated: true })
	})

	it('смена узла при открытом листе сдвигает вид к новому узлу', async () => {
		const { setViewport, details } = await mountAndOpen(node('api'))
		details.value = node('db')
		await nextTick()
		expect(setViewport).toHaveBeenCalledTimes(2)
	})

	it('для связи и группы (у них нет прямоугольника узла) вид не сдвигается', async () => {
		const { setViewport } = await mountAndOpen({ entity: 'edge', id: 'e1' })
		expect(screen.getByRole('dialog', { name: UI_FLOW_PANELS.DETAILS_EDGE })).toBeInTheDocument()
		expect(setViewport).not.toHaveBeenCalled()
	})

	it('на широком экране вид не сдвигается', async () => {
		const { setViewport } = await mountAndOpen(node('api'), { isCompact: false })
		expect(setViewport).not.toHaveBeenCalled()
	})

	describe('кнопка «Назад» браузера', () => {
		it('открытие листа добавляет запись в историю', async () => {
			const push = vi.spyOn(window.history, 'pushState')
			await mountAndOpen(node('api'))
			expect(push).toHaveBeenCalledWith({ riseFlowDetails: true }, '')
		})

		it('«Назад» закрывает лист и больше записи не трогает', async () => {
			const { details } = await mountAndOpen(node('api'))
			window.dispatchEvent(new PopStateEvent('popstate'))
			await nextTick()
			expect(details.value).toBeNull()
			expect(window.history.back).not.toHaveBeenCalled()
		})

		it('закрытие листа кнопкой убирает свою запись из истории', async () => {
			const { details } = await mountAndOpen(node('api'))
			details.value = null
			await nextTick()
			expect(window.history.back).toHaveBeenCalledTimes(1)
		})

		it('если запись уже не наша, историю не трогаем', async () => {
			vi.spyOn(window.history, 'pushState').mockImplementation(() => undefined)
			window.history.replaceState(null, '')
			const { details } = await mountAndOpen(node('api'))
			details.value = null
			await nextTick()
			expect(window.history.back).not.toHaveBeenCalled()
		})

		it('после закрытия «Назад» больше не закрывает ничего', async () => {
			const { details, openDetails } = await mountAndOpen(node('api'))
			details.value = null
			await nextTick()
			openDetails.mockClear()
			window.dispatchEvent(new PopStateEvent('popstate'))
			expect(openDetails).not.toHaveBeenCalled()
		})

		it('размонтирование открытого листа снимает слушатель', async () => {
			const { unmount, openDetails } = await mountAndOpen(node('api'))
			unmount()
			window.dispatchEvent(new PopStateEvent('popstate'))
			expect(openDetails).not.toHaveBeenCalled()
		})

		it('на широком экране историю не трогаем', async () => {
			const push = vi.spyOn(window.history, 'pushState')
			await mountAndOpen(node('api'), { isCompact: false })
			expect(push).not.toHaveBeenCalled()
		})
	})
})
