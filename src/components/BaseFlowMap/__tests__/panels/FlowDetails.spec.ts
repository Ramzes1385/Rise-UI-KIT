import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_PANELS } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import FlowDetails from '../../ui/panels/FlowDetails.vue'
import type { FlowElementRef } from '../../types/data/flowReview.types'
import { fireEvent, render, screen, within } from '@testing-library/vue'
import { createFakeContext, panelsData, provideContext } from '../fixtures/panelsContext'

function mount(options: Parameters<typeof createFakeContext>[0] = {}) {
	const fake = createFakeContext(options)
	const view = render(FlowDetails, { global: provideContext(fake.context) })
	return { ...fake, ...view }
}

const node = (id: string): FlowElementRef => ({ entity: 'node', id })

describe('FlowDetails: боковая панель', () => {
	it('без выбранного элемента ничего не показывает', () => {
		mount()
		expect(screen.queryByRole('region')).not.toBeInTheDocument()
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('узел: область с подписью, заголовок, вид, дорожка, статус и описание', () => {
		mount({ details: node('api') })
		const panel = screen.getByRole('region', { name: UI_FLOW_PANELS.DETAILS_NODE })
		expect(within(panel).getByText('API')).toBeInTheDocument()
		expect(within(panel).getByText('Сервис · Go')).toBeInTheDocument()
		expect(within(panel).getByText('Ядро')).toBeInTheDocument()
		expect(within(panel).getByText(UI_FLOW_PANELS.STATUS_OK)).toBeInTheDocument()
		expect(within(panel).getByText('Принимает заказы')).toBeInTheDocument()
	})

	it('связь и группа получают свои названия области', () => {
		mount({ details: { entity: 'edge', id: 'e1' } })
		expect(screen.getByRole('region', { name: UI_FLOW_PANELS.DETAILS_EDGE })).toBeInTheDocument()
	})

	it('группа: название области и заголовок', () => {
		mount({ details: { entity: 'group', id: 'core' } })
		const panel = screen.getByRole('region', { name: UI_FLOW_PANELS.DETAILS_GROUP })
		expect(within(panel).getByText('Ядро')).toBeInTheDocument()
		expect(within(panel).getByText('Основные сервисы')).toBeInTheDocument()
	})

	it('метрики показываются таблицей описаний с заголовком', () => {
		mount({ details: node('api') })
		expect(screen.getByText(UI_FLOW_PANELS.DETAILS_METRICS)).toBeInTheDocument()
		expect(screen.getByText('Запросы')).toBeInTheDocument()
		expect(screen.getByText(/120 мс ↓/)).toBeInTheDocument()
	})

	it('поля: значение со ссылкой — ссылка, без — текст', () => {
		mount({ details: node('api') })
		expect(screen.getByRole('link', { name: 'orders' })).toHaveAttribute('href', 'https://git.example/orders')
		expect(screen.getByText('Репозиторий')).toBeInTheDocument()
		expect(screen.getByText('Версия')).toBeInTheDocument()
		expect(screen.getByText('3')).toBeInTheDocument()
	})

	it('«Вызывает» и «Вызывают» перечисляют соседей', () => {
		mount({ details: node('api') })
		expect(screen.getByText(UI_FLOW_PANELS.DETAILS_CALLS).nextElementSibling).toHaveTextContent('Заказы БД, Банк')
		expect(screen.getByText(UI_FLOW_PANELS.DETAILS_CALLED_BY).nextElementSibling).toHaveTextContent('Банк')
	})

	it('если вызывающих нет, строки «Вызывают» нет; если соседей нет вовсе — нет блока', () => {
		mount({ details: node('db') })
		expect(screen.queryByText(UI_FLOW_PANELS.DETAILS_CALLS)).not.toBeInTheDocument()
		expect(screen.getByText(UI_FLOW_PANELS.DETAILS_CALLED_BY)).toBeInTheDocument()
	})

	it('одинокий узел: ни связей, ни метрик, ни подвала', () => {
		const { container } = mount({ details: node('lonely') })
		expect(screen.queryByText(UI_FLOW_PANELS.DETAILS_CALLS)).not.toBeInTheDocument()
		expect(screen.queryByText(UI_FLOW_PANELS.DETAILS_CALLED_BY)).not.toBeInTheDocument()
		expect(screen.queryByText(UI_FLOW_PANELS.DETAILS_METRICS)).not.toBeInTheDocument()
		expect(container.querySelector('.base-flow-map__details-foot')).toBeNull()
		expect(container.querySelector('.base-flow-map__details-description')).toBeNull()
	})

	it('ответственный со ссылкой — ссылка «Команда «…»», ссылки узла — внешняя открывается в новой вкладке', () => {
		mount({ details: node('api') })
		const team = formatMessage(UI_FLOW_PANELS.DETAILS_TEAM, { name: 'Платежи' })
		expect(screen.getByRole('link', { name: team })).toHaveAttribute('href', 'https://team.example/payments')
		const external = screen.getByRole('link', { name: /Документация/ })
		expect(external).toHaveAttribute('target', '_blank')
		expect(external).toHaveAttribute('rel', 'noopener noreferrer')
		const internal = screen.getByRole('link', { name: 'Дашборд' })
		expect(internal).toHaveAttribute('href', '/dash')
		expect(internal).not.toHaveAttribute('target')
		expect(internal).not.toHaveAttribute('rel')
	})

	it('ответственный без ссылки — просто текст', () => {
		mount({ details: node('db') })
		const team = formatMessage(UI_FLOW_PANELS.DETAILS_TEAM, { name: 'Данные' })
		expect(screen.getByText(team)).toBeInTheDocument()
		expect(screen.queryByRole('link', { name: team })).not.toBeInTheDocument()
	})

	it('узел только со ссылками: подвал есть, ответственного в нём нет', () => {
		const data = panelsData()
		data.nodes.push({ id: 'docs', kind: 'service', label: 'Доки', links: [{ label: 'Wiki', href: '/wiki' }] })
		const { container } = mount({ data, details: node('docs') })
		expect(screen.getByRole('link', { name: 'Wiki' })).toBeInTheDocument()
		expect(container.querySelector('.base-flow-map__details-team')).toBeNull()
	})

	it('кнопка «Закрыть» закрывает подробности', async () => {
		const { openDetails, details } = mount({ details: node('api') })
		const user = userEvent.setup()
		await user.click(screen.getByRole('button', { name: UI_FLOW_PANELS.DETAILS_CLOSE }))
		expect(openDetails).toHaveBeenCalledWith(null)
		await nextTick()
		expect(details.value).toBeNull()
		expect(screen.queryByRole('region')).not.toBeInTheDocument()
	})

	it('Escape закрывает панель и отменяет событие', async () => {
		const { openDetails } = mount({ details: node('api') })
		const panel = screen.getByRole('region')
		const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
		panel.dispatchEvent(event)
		expect(event.defaultPrevented).toBe(true)
		expect(openDetails).toHaveBeenCalledWith(null)
	})

	it('другие клавиши и уже обработанный Escape панель не закрывают', async () => {
		const { openDetails } = mount({ details: node('api') })
		const panel = screen.getByRole('region')
		await fireEvent.keyDown(panel, { key: 'Enter' })
		const handled = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
		handled.preventDefault()
		panel.dispatchEvent(handled)
		expect(openDetails).not.toHaveBeenCalled()
	})

	it('при смене выбранного узла содержимое обновляется', async () => {
		const { details } = mount({ details: node('api') })
		details.value = node('bank')
		await nextTick()
		const panel = screen.getByRole('region')
		expect(within(panel).getByText('Банк')).toBeInTheDocument()
		expect(within(panel).getByText('Деградация')).toBeInTheDocument()
		expect(within(panel).queryByText('Принимает заказы')).not.toBeInTheDocument()
	})

	it('исчезновение выбранного узла из данных закрывает панель', async () => {
		const { data } = mount({ details: node('lonely') })
		data.value = { ...panelsData(), nodes: panelsData().nodes.filter(item => item.id !== 'lonely') }
		await nextTick()
		expect(screen.queryByRole('region')).not.toBeInTheDocument()
	})

	describe('возврат фокуса', () => {
		let trigger: HTMLButtonElement

		beforeEach(() => {
			trigger = document.createElement('button')
			document.body.append(trigger)
			trigger.focus()
		})

		afterEach(() => trigger.remove())

		it('после закрытия фокус возвращается на элемент, с которого открыли', async () => {
			const { details } = mount()
			details.value = node('api')
			await nextTick()
			screen.getByRole('button', { name: UI_FLOW_PANELS.DETAILS_CLOSE }).focus()
			details.value = null
			await nextTick()
			await nextTick()
			expect(trigger).toHaveFocus()
		})

		it('если элемент к тому времени убрали из документа, фокус не трогается', async () => {
			const { details } = mount()
			details.value = node('api')
			await nextTick()
			trigger.remove()
			details.value = null
			await nextTick()
			await nextTick()
			expect(document.body).toHaveFocus()
		})

		it('если фокус был не на HTML-элементе, возвращать нечего', async () => {
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
			svg.setAttribute('tabindex', '0')
			document.body.append(svg)
			svg.focus()
			const { details } = mount()
			details.value = node('api')
			await nextTick()
			details.value = null
			await nextTick()
			await nextTick()
			expect(trigger).not.toHaveFocus()
			svg.remove()
		})
	})
})
