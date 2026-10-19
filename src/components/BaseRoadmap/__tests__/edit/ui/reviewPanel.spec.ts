import { enableAutoUnmount } from '@vue/test-utils'
import { screen, within } from '@testing-library/vue'
import { mountReview } from '../fixtures/renderEditor'
import type { RoadmapReviewData } from '../../../types/roadmapEdit.types'
import { UI_COMMENT_THREAD, UI_ROADMAP, UI_ROADMAP_REVIEW } from '@/locales/messages'

vi.setConfig({ testTimeout: 60_000 })
enableAutoUnmount(afterEach)

const ANNA = { name: 'Анна' }
const ME = { name: 'Роман' }

function review(): RoadmapReviewData {
	return {
		currentUser: ME,
		proposals: [
			{
				id: 'p1',
				author: ANNA,
				date: 3000,
				label: 'Переименовать тему a',
				changes: [{ type: 'update', entity: 'topic', id: 'a', patch: { title: 'Новая тема' }, previous: { title: 'Тема a' } }],
				status: 'open',
			},
			{
				id: 'p2',
				author: ME,
				date: 2000,
				label: 'Правка b',
				changes: [{ type: 'update', entity: 'topic', id: 'b', patch: { title: 'Другая b' }, previous: { title: 'Старая b' } }],
				status: 'open',
			},
			{
				id: 'p3',
				author: ANNA,
				date: 1500,
				changes: [{ type: 'add', entity: 'stage', value: { id: 'n', title: 'Новый этап', topics: [] }, index: 3 }],
				status: 'accepted',
			},
			{
				id: 'p4',
				author: ME,
				date: 1000,
				changes: [{ type: 'move', entity: 'stage', id: 's1', from: 0, to: 2 }],
				status: 'rejected',
			},
		],
		threads: [
			{
				id: 't1',
				target: { entity: 'topic', id: 'a' },
				isUnread: true,
				comments: [{ id: 'c1', author: ANNA, text: 'Проверьте формулировку', date: Date.now() - 60_000 }],
			},
			{
				id: 't2',
				target: { entity: 'stage', id: 's2' },
				isResolved: true,
				comments: [{ id: 'c2', author: ME, text: 'Готово', date: Date.now() - 120_000 }],
			},
		],
	}
}

const card = (title: RegExp) => screen.getByRole('listitem', { name: title })

describe('«Правки»: предложения', () => {
	it('без предложений — пустое состояние и нули на вкладках', async () => {
		await mountReview({ review: { currentUser: ME } })
		expect(screen.getByText(UI_ROADMAP_REVIEW.EMPTY_PROPOSALS)).toBeInTheDocument()
		expect(screen.getByRole('tab', { name: `${UI_ROADMAP_REVIEW.TAB_PROPOSALS} 0` })).toBeInTheDocument()
		expect(screen.getByRole('tab', { name: `${UI_ROADMAP_REVIEW.TAB_COMMENTS} 0` })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: /Принять все/ })).not.toBeInTheDocument()
	})

	it('карточки: автор, вид, заголовок, поля «было → стало»; решённые — со статусом вместо кнопок', async () => {
		await mountReview({ review: review() })
		const first = card(/Предложение: Переименовать тему a, автор Анна/)
		expect(within(first).getByText('Анна')).toBeInTheDocument()
		expect(within(first).getByText(UI_ROADMAP_REVIEW.KIND_RENAME)).toBeInTheDocument()
		expect(within(first).getByText(UI_ROADMAP_REVIEW.FIELD_TITLE)).toBeInTheDocument()
		expect(within(first).getByText('Тема a').tagName).toBe('DEL')
		expect(within(first).getByText('Новая тема').tagName).toBe('INS')
		expect(within(first).getByRole('button', { name: UI_ROADMAP_REVIEW.ACCEPT })).toBeEnabled()
		const accepted = card(/Предложение: Добавить «Новый этап»/)
		expect(within(accepted).getByText(UI_ROADMAP_REVIEW.STATUS_ACCEPTED)).toBeInTheDocument()
		expect(within(accepted).queryByRole('button')).not.toBeInTheDocument()
		expect(within(accepted).getByText(/\+1 этап/)).toBeInTheDocument()
		const rejected = card(/Предложение: Перенести «Этап s1»/)
		expect(within(rejected).getByText(UI_ROADMAP_REVIEW.STATUS_REJECTED)).toBeInTheDocument()
		expect(within(rejected).getByText(UI_ROADMAP_REVIEW.KIND_MOVE)).toBeInTheDocument()
	})

	it('устаревшее предложение: бейдж, кнопка «Принять» недоступна, причина связана с ней', async () => {
		await mountReview({ review: review() })
		const stale = card(/Предложение: Правка b/)
		expect(within(stale).getByText(UI_ROADMAP_REVIEW.STALE)).toBeInTheDocument()
		const accept = within(stale).getByRole('button', { name: UI_ROADMAP_REVIEW.ACCEPT })
		expect(accept).toHaveAttribute('aria-disabled', 'true')
		expect(accept).toHaveAccessibleDescription(UI_ROADMAP_REVIEW.STALE_REASON)
	})

	it('«Принять» применяет правку одним шагом, объявляет и меняет карточку и счётчик', async () => {
		const { user, onData } = await mountReview({ review: review() })
		await user.click(within(card(/Переименовать тему a/)).getByRole('button', { name: UI_ROADMAP_REVIEW.ACCEPT }))
		await vi.waitFor(() =>
			expect(within(card(/Переименовать тему a/)).getByText(UI_ROADMAP_REVIEW.STATUS_ACCEPTED)).toBeInTheDocument(),
		)
		expect(onData).toHaveBeenCalledOnce()
		expect(onData.mock.calls[0][0].stages[0].topics[0].title).toBe('Новая тема')
		expect(screen.getByRole('tab', { name: `${UI_ROADMAP_REVIEW.TAB_PROPOSALS} 1` })).toBeInTheDocument()
	})

	it('«Отклонить» помечает предложение и не трогает данные', async () => {
		const { user, onData } = await mountReview({ review: review() })
		await user.click(within(card(/Переименовать тему a/)).getByRole('button', { name: UI_ROADMAP_REVIEW.DECLINE }))
		await vi.waitFor(() =>
			expect(within(card(/Переименовать тему a/)).getByText(UI_ROADMAP_REVIEW.STATUS_REJECTED)).toBeInTheDocument(),
		)
		expect(onData).not.toHaveBeenCalled()
	})

	it('«Принять все» принимает только готовые, устаревшие остаются', async () => {
		const { user, onData } = await mountReview({ review: review() })
		const all = screen.getByRole('button', { name: 'Принять все: 1' })
		await user.click(all)
		await vi.waitFor(() => expect(onData).toHaveBeenCalledOnce())
		await vi.waitFor(() => expect(screen.queryByRole('button', { name: /Принять все/ })).not.toBeInTheDocument())
		expect(within(card(/Правка b/)).getByRole('button', { name: UI_ROADMAP_REVIEW.ACCEPT })).toHaveAttribute('aria-disabled', 'true')
	})

	it('фильтр «Ждут решения» прячет решённые, «Только мои» — чужие', async () => {
		const { user } = await mountReview({ review: review() })
		await user.click(screen.getByRole('radio', { name: UI_ROADMAP_REVIEW.SHOW_OPEN }))
		expect(screen.queryByRole('listitem', { name: /Добавить «Новый этап»/ })).not.toBeInTheDocument()
		expect(screen.getByRole('listitem', { name: /Правка b/ })).toBeInTheDocument()
		await user.click(screen.getByRole('radio', { name: UI_ROADMAP_REVIEW.SHOW_MINE }))
		expect(screen.queryByRole('listitem', { name: /автор Анна/ })).not.toBeInTheDocument()
		expect(screen.getAllByRole('listitem', { name: /автор Роман/ })).toHaveLength(2)
		await user.click(screen.getByRole('radio', { name: UI_ROADMAP_REVIEW.SHOW_ALL }))
		expect(screen.getAllByRole('listitem', { name: /Предложение:/ })).toHaveLength(4)
	})
})

describe('«Правки»: комментарии', () => {
	async function openComments(props = { review: review() }) {
		const mounted = await mountReview(props)
		await mounted.user.click(screen.getByRole('tab', { name: new RegExp(UI_ROADMAP_REVIEW.TAB_COMMENTS) }))
		return mounted
	}

	it('без выбранного элемента — подсказка вместо поля, цепочки в списке с состоянием', async () => {
		await openComments()
		expect(screen.getByText(UI_ROADMAP_REVIEW.COMMENT_HINT)).toBeInTheDocument()
		expect(screen.getByText('Проверьте формулировку')).toBeInTheDocument()
		expect(screen.getByText(UI_ROADMAP_REVIEW.THREAD_NEW)).toBeInTheDocument()
		expect(screen.getByText(UI_ROADMAP_REVIEW.THREAD_RESOLVED)).toBeInTheDocument()
	})

	it('пустой список комментариев', async () => {
		await openComments({ review: { currentUser: ME } })
		expect(screen.getByText(UI_ROADMAP_REVIEW.EMPTY_COMMENTS)).toBeInTheDocument()
	})

	it('решённые прячутся переключателем', async () => {
		const { user } = await openComments()
		await user.click(screen.getByRole('switch', { name: UI_ROADMAP_REVIEW.SHOW_RESOLVED }))
		expect(screen.queryByText('Готово')).not.toBeInTheDocument()
		expect(screen.getByText('Проверьте формулировку')).toBeInTheDocument()
	})

	it('выбранная тема открывает поле комментария; отправка создаёт цепочку и очищает поле', async () => {
		const { user } = await mountReview({ review: review() })
		await user.click(screen.getByRole('button', { name: /^Тема b/ }))
		await user.click(screen.getByRole('tab', { name: new RegExp(UI_ROADMAP_REVIEW.TAB_COMMENTS) }))
		const input = screen.getByRole('textbox', { name: 'Комментарий к «Тема b»' })
		const send = screen.getByRole('button', { name: UI_ROADMAP_REVIEW.COMMENT_SEND })
		expect(send).toBeDisabled()
		await user.type(input, 'Нужна ссылка')
		await user.click(send)
		await vi.waitFor(() => expect(screen.getAllByText('Нужна ссылка').length).toBeGreaterThan(0))
		expect(input).toHaveValue('')
		expect(screen.getByRole('tab', { name: `${UI_ROADMAP_REVIEW.TAB_COMMENTS} 3` })).toBeInTheDocument()
	})

	it('цепочка открывается, читается и принимает ответ; «Решено» и «Вернуть» меняют статус', async () => {
		const { user } = await openComments()
		const thread = document.querySelector('button.base-roadmap__review-card-title[aria-expanded]') as HTMLElement
		await user.click(thread)
		expect(thread).toHaveAttribute('aria-expanded', 'true')
		await vi.waitFor(() => expect(screen.queryByText(UI_ROADMAP_REVIEW.THREAD_NEW)).not.toBeInTheDocument())
		const reply = await screen.findByRole('button', { name: /Ответить/ })
		await user.click(reply)
		const boxes = await screen.findAllByRole('textbox')
		await user.type(boxes[boxes.length - 1], 'Исправлю')
		const form = boxes[boxes.length - 1].closest('form') as HTMLElement
		await user.click(within(form).getByRole('button', { name: UI_COMMENT_THREAD.SEND }))
		await vi.waitFor(() => expect(screen.getAllByText('Исправлю').length).toBeGreaterThan(0))
		await user.click(screen.getAllByRole('button', { name: UI_ROADMAP_REVIEW.RESOLVE })[0])
		await vi.waitFor(() => expect(screen.getAllByText(UI_ROADMAP_REVIEW.THREAD_RESOLVED).length).toBe(2))
		await user.click(screen.getAllByRole('button', { name: UI_ROADMAP_REVIEW.REOPEN })[0])
		await vi.waitFor(() => expect(screen.getAllByText(UI_ROADMAP_REVIEW.THREAD_RESOLVED).length).toBe(1))
		await user.click(thread)
		expect(thread).toHaveAttribute('aria-expanded', 'false')
	})

	it('«Показать» выделяет элемент цепочки в пути', async () => {
		const { user } = await openComments()
		await user.click(screen.getAllByRole('button', { name: UI_ROADMAP_REVIEW.SHOW_ELEMENT })[0])
		await vi.waitFor(() => expect(screen.getByRole('complementary', { name: UI_ROADMAP.PANEL_LABEL })).toBeInTheDocument())
	})
})

describe('«Правки» на узком экране', () => {
	it('панель встаёт под областью пути и становится компактной', async () => {
		await mountReview({ review: review() }, 375)
		const panel = screen.getByRole('region', { name: UI_ROADMAP_REVIEW.PANEL })
		expect(panel).toHaveClass('base-roadmap__review--compact')
		const aside = panel.closest('aside') as HTMLElement
		const area = document.querySelector('.base-roadmap__area') as HTMLElement
		expect(aside.compareDocumentPosition(area) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
		expect(document.querySelector('.base-roadmap')).toHaveClass('base-roadmap--narrow')
		expect(within(panel).getByRole('button', { name: 'Принять все: 1' })).toBeInTheDocument()
	})

	it('на широком экране панель без компактного вида, шторка темы не открывается', async () => {
		await mountReview({ review: review() })
		expect(screen.getByRole('region', { name: UI_ROADMAP_REVIEW.PANEL })).not.toHaveClass('base-roadmap__review--compact')
	})
})
