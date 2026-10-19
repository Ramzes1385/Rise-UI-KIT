import '@testing-library/jest-dom/vitest'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import { mountReview, stubFrame } from '../fixtures/reviewUi'
import { screen, waitFor, within } from '@testing-library/vue'
import { moveB, renameA, suggestion } from '../fixtures/reviewHarness'

beforeEach(() => stubFrame(1200))

const status = () => screen.getAllByRole('status').find(item => item.classList.contains('base-flow-map__review-status')) as HTMLElement

describe('строка состояния', () => {
	it('считает ждущие, принятые и отклонённые предложения', () => {
		mountReview({
			suggestions: [
				suggestion('s1', [renameA]),
				suggestion('s2', [moveB]),
				suggestion('s3', [renameA], { status: 'accepted' }),
				suggestion('s4', [renameA], { status: 'declined' }),
			],
		})
		expect(status()).toHaveTextContent(`${UI_FLOW_REVIEW.STATUS_WAITING}: 2`)
		expect(status()).toHaveTextContent(`${UI_FLOW_REVIEW.STATUS_ACCEPTED_SHORT}: 1`)
		expect(status()).toHaveTextContent(`${UI_FLOW_REVIEW.STATUS_DECLINED_SHORT}: 1`)
	})

	it('числа обновляются после решения', async () => {
		const user = userEvent.setup()
		mountReview({ suggestions: [suggestion('s1', [renameA])] })
		await user.click(screen.getByRole('button', { name: UI_FLOW_REVIEW.DECLINE }))
		expect(status()).toHaveTextContent(`${UI_FLOW_REVIEW.STATUS_WAITING}: 0`)
		expect(status()).toHaveTextContent(`${UI_FLOW_REVIEW.STATUS_DECLINED_SHORT}: 1`)
	})
})

describe('число привязок и скрытая внутренняя подписка', () => {
	const count = () => within(status()).getByRole('button', { name: UI_FLOW_REVIEW.HOOKS }).querySelector('.base-flow-map__review-count')

	it('внутренняя подписка flowReviewInternal не считается и не показывается: без обработчиков приложения — 0 и пустой список', async () => {
		const user = userEvent.setup()
		const view = mountReview()
		expect(view.controller.getBindings().some(item => item.handler === 'flowReviewInternal')).toBe(true)
		expect(count()).toHaveTextContent('0')
		expect(count()).toHaveAttribute('aria-hidden', 'true')
		await user.click(within(status()).getByRole('button', { name: UI_FLOW_REVIEW.HOOKS }))
		const dialog = await screen.findByRole('dialog', { name: UI_FLOW_REVIEW.HOOKS })
		expect(within(dialog).queryAllByRole('listitem')).toHaveLength(0)
		expect(within(dialog).queryByText('update:suggestions', { selector: 'code' })).toBeNull()
	})

	it('число привязок видно сразу после монтирования и растёт после открытия окна; обработчик приложения на том же событии виден', async () => {
		const user = userEvent.setup()
		const view = mountReview({ plugins: [{ name: 'early', setup: controller => void controller.on('accept', () => undefined) }] })
		expect(count()).toHaveTextContent('1')
		view.controller.on('update:suggestions', () => undefined)
		await user.click(within(status()).getByRole('button', { name: UI_FLOW_REVIEW.HOOKS }))
		const dialog = await screen.findByRole('dialog', { name: UI_FLOW_REVIEW.HOOKS })
		expect(within(dialog).getByText('update:suggestions', { selector: 'code' })).toBeInTheDocument()
		expect(count()).toHaveTextContent('2')
	})
})

describe('хуки правок', () => {
	const openHooks = async (user: ReturnType<typeof userEvent.setup>) => {
		const trigger = within(status()).getByRole('button', { name: UI_FLOW_REVIEW.HOOKS })
		await user.click(trigger)
		return { trigger, dialog: await screen.findByRole('dialog', { name: UI_FLOW_REVIEW.HOOKS }) }
	}
	const rowOf = (dialog: HTMLElement, name: string) =>
		within(dialog)
			.getAllByRole('listitem')
			.find(row => within(row).queryByText(name, { selector: 'code' })) as HTMLElement

	it('окно открывается кнопкой с aria-expanded и озаглавлено', async () => {
		const user = userEvent.setup()
		mountReview()
		const { trigger, dialog } = await openHooks(user)
		expect(trigger).toHaveAttribute('aria-expanded', 'true')
		expect(within(dialog).getByText(UI_FLOW_REVIEW.HOOKS_TITLE)).toBeInTheDocument()
	})

	it('обработчики приложения: событие, функция, отменяемость, число вызовов; выключатель', async () => {
		const user = userEvent.setup()
		const view = mountReview()
		function onAccept(): void {}
		view.controller.on('accept', onAccept)
		view.controller.on('beforeAccept', () => undefined)
		const { dialog } = await openHooks(user)
		const accept = rowOf(dialog, 'accept')
		expect(within(accept).getByText('onAccept')).toBeInTheDocument()
		expect(within(accept).getByText('вызван 0 раз')).toBeInTheDocument()
		expect(within(accept).queryByText(UI_FLOW_REVIEW.HOOK_CANCELLABLE)).toBeNull()
		const before = rowOf(dialog, 'beforeAccept')
		expect(within(before).getByText(UI_FLOW_REVIEW.HOOK_ANONYMOUS)).toBeInTheDocument()
		expect(within(before).getByText(UI_FLOW_REVIEW.HOOK_CANCELLABLE)).toBeInTheDocument()
		const toggle = within(accept).getByRole('switch', { name: formatMessage(UI_FLOW_REVIEW.HOOK_ON, { name: 'accept' }) })
		expect(toggle).toBeChecked()
		await user.click(toggle)
		await waitFor(() =>
			expect(
				within(rowOf(dialog, 'accept')).getByRole('switch', { name: formatMessage(UI_FLOW_REVIEW.HOOK_OFF, { name: 'accept' }) }),
			).not.toBeChecked(),
		)
		expect(view.controller.getBindings().find(item => item.name === 'accept')?.isEnabled).toBe(false)
	})

	it('Escape закрывает окно, при повторном открытии список обновлён; чужие события не показываются', async () => {
		const user = userEvent.setup()
		const view = mountReview()
		view.controller.on('node-click', () => undefined)
		const { trigger, dialog } = await openHooks(user)
		expect(within(dialog).queryByText('node-click')).toBeNull()
		await user.keyboard('{Escape}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
		view.controller.on('decline', () => undefined)
		const reopened = await openHooks(user)
		expect(within(reopened.dialog).getByText('decline', { selector: 'code' })).toBeInTheDocument()
	})
})
