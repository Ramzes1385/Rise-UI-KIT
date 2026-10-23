import { editData } from '../fixtures/editFixtures'
import { screen, within } from '@testing-library/vue'
import { renderRoadmap } from '../../fixtures/renderRoadmap'
import { LOAD_TIMEOUT, liveText, renderEditor } from '../fixtures/renderEditor'
import { UI_ROADMAP, UI_ROADMAP_EDIT, UI_ROADMAP_REVIEW } from '@/locales/messages'

vi.setConfig({ testTimeout: 60_000 })

const pick = (title: string) => screen.getByRole('button', { name: new RegExp(`^${title}`) })
const names = () =>
	screen.getAllByRole('listitem').map(item => item.getAttribute('data-roadmap-topic') ?? item.getAttribute('data-roadmap-stage'))

describe('режимы «Просмотр» / «Правка» / «Правки»', () => {
	it('переключатель в шапке меняет режим и сообщает наружу', async () => {
		const onMode = vi.fn()
		const { user } = await renderRoadmap({
			props: { data: editData(), modes: ['view', 'edit', 'review'], 'onUpdate:mode': onMode } as never,
		})
		expect(screen.queryByLabelText(UI_ROADMAP_EDIT.AREA_LABEL)).not.toBeInTheDocument()
		await user.click(screen.getByRole('radio', { name: UI_ROADMAP.MODE_EDIT }))
		expect(onMode).toHaveBeenCalledWith('edit')
		await screen.findByLabelText(UI_ROADMAP_EDIT.AREA_LABEL, {}, { timeout: LOAD_TIMEOUT })
		await user.click(screen.getByRole('radio', { name: UI_ROADMAP.MODE_REVIEW }))
		expect(onMode).toHaveBeenLastCalledWith('review')
		await screen.findByRole('region', { name: UI_ROADMAP_REVIEW.PANEL }, { timeout: LOAD_TIMEOUT })
		expect(screen.queryByLabelText(UI_ROADMAP_EDIT.AREA_LABEL)).not.toBeInTheDocument()
		await user.click(screen.getByRole('radio', { name: UI_ROADMAP.MODE_VIEW }))
		expect(onMode).toHaveBeenLastCalledWith('view')
		expect(screen.getByRole('radiogroup', { name: UI_ROADMAP.MODE_LABEL })).toBeInTheDocument()
	})

	it('без modes переключателя нет, а режим берётся из пропса', async () => {
		await renderEditor()
		expect(screen.queryByRole('radiogroup', { name: UI_ROADMAP.MODE_LABEL })).not.toBeInTheDocument()
		expect(screen.getByRole('region', { name: UI_ROADMAP_EDIT.AREA_LABEL })).toBeInTheDocument()
	})
})

describe('поверхность «Правки»', () => {
	it('показывает этапы и темы с номерами, подвал считает этапы, темы и правки', async () => {
		await renderEditor()
		expect(names()).toEqual(expect.arrayContaining(['s1', 'a', 'b', 'c', 's2', 'd', 'e', 's3']))
		const footer = screen.getByLabelText(UI_ROADMAP_EDIT.STATUS_LABEL)
		expect(within(footer).getByText(UI_ROADMAP_EDIT.FOOTER_STAGES).textContent).toContain('3')
		expect(within(footer).getByText(UI_ROADMAP_EDIT.FOOTER_TOPICS).textContent).toContain('5')
		expect(within(footer).getByText(UI_ROADMAP_EDIT.FOOTER_CHANGES).textContent).toContain('0')
		expect(screen.getByText(UI_ROADMAP_EDIT.INSPECTOR_EMPTY)).toBeInTheDocument()
	})

	it('пустой путь показывает пустое состояние', async () => {
		await renderEditor({ data: { version: 1, title: 'Пусто', stages: [] } })
		expect(screen.getByText(UI_ROADMAP_EDIT.EMPTY)).toBeInTheDocument()
	})

	it('подпись «Черновик сохранён» появляется вместе с датой', async () => {
		await renderEditor({ draftSavedAt: new Date(2026, 9, 19, 0, 52) })
		expect(screen.getByText(/Черновик сохранён/)).toBeInTheDocument()
	})

	it('добавление этапа и темы выделяет новое, объявляет в живой области и меняет счётчики', async () => {
		const { user } = await renderEditor()
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.ADD_STAGE }))
		await vi.waitFor(() => expect(liveText()).toContain('Добавлен этап'))
		expect(screen.getByLabelText(UI_ROADMAP_EDIT.INSPECTOR_LABEL)).toHaveTextContent(UI_ROADMAP_EDIT.NEW_STAGE)
		await user.click(screen.getAllByRole('button', { name: UI_ROADMAP_EDIT.ADD_TOPIC })[0])
		await vi.waitFor(() => expect(liveText()).toContain('Добавлена тема'))
		const footer = screen.getByLabelText(UI_ROADMAP_EDIT.STATUS_LABEL)
		expect(footer).toHaveTextContent(/Изменений\s*2/)
	})

	it('отмена и повтор: кнопки доступны по истории, объявление называет шаг', async () => {
		const { user } = await renderEditor()
		const undo = screen.getByRole('button', { name: UI_ROADMAP_EDIT.UNDO })
		const redo = screen.getByRole('button', { name: UI_ROADMAP_EDIT.REDO })
		expect(undo).toBeDisabled()
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.ADD_STAGE }))
		await vi.waitFor(() => expect(undo).toBeEnabled())
		await user.click(undo)
		expect(liveText()).toContain('Отменено: Добавлен этап')
		expect(redo).toBeEnabled()
		await user.click(redo)
		expect(liveText()).toContain('Повторено: Добавлен этап')
	})

	it('сворачивание и разворачивание этапов: по одному и все сразу', async () => {
		const { user } = await renderEditor()
		const toggle = screen.getByRole('button', { name: 'Темы этапа «Этап s1»' })
		expect(toggle).toHaveAttribute('aria-expanded', 'true')
		await user.click(toggle)
		expect(toggle).toHaveAttribute('aria-expanded', 'false')
		expect(screen.queryByRole('list', { name: 'Этап s1' })).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.COLLAPSE_ALL }))
		expect(screen.queryByRole('list', { name: 'Этап s2' })).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.EXPAND_ALL }))
		expect(screen.getByRole('list', { name: 'Этап s2' })).toBeInTheDocument()
	})

	it('публикация отдаёт данные наружу', async () => {
		const onPublish = vi.fn()
		const { user } = await renderEditor({ onPublish } as never)
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.PUBLISH }))
		expect(onPublish).toHaveBeenCalledWith(expect.objectContaining({ title: 'Путь' }))
	})

	it('шаблон из меню вставляет этап; шаблон «Пустой» поверх непустого ждёт подтверждения', async () => {
		const { user } = await renderEditor()
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.TEMPLATES }))
		await user.click(await screen.findByRole('menuitem', { name: new RegExp(UI_ROADMAP_EDIT.TPL_STAGE) }))
		await vi.waitFor(() => expect(liveText()).toContain('Шаблон'))
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.TEMPLATES }))
		await user.click(await screen.findByRole('menuitem', { name: new RegExp(UI_ROADMAP_EDIT.TPL_EMPTY) }))
		const dialog = await screen.findByRole('alertdialog')
		await user.click(within(dialog).getByRole('button', { name: UI_ROADMAP_EDIT.CONFIRM_CANCEL }))
		await vi.waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
		expect(screen.getByLabelText(UI_ROADMAP_EDIT.STATUS_LABEL)).toHaveTextContent(/Этапов\s*4/)
	})

	it('отключённый роадмап: кнопки и поля недоступны, правка отказывает', async () => {
		await renderEditor({ isDisabled: true })
		expect(screen.getByRole('button', { name: UI_ROADMAP_EDIT.ADD_STAGE })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Перетащить тему «Тема a»' })).toBeDisabled()
		expect(screen.getByRole('button', { name: UI_ROADMAP_EDIT.UNDO })).toBeDisabled()
	})
})

describe('панель отказа', () => {
	it('связь, замыкающая цикл, — плашка с причиной; закрывается; подсказка «Отменить» после первой правки', async () => {
		const { user } = await renderEditor()
		await user.click(screen.getByRole('radio', { name: UI_ROADMAP_EDIT.TOOL_LINK }))
		expect(screen.getByText(UI_ROADMAP_EDIT.LINK_SOURCE)).toBeInTheDocument()
		await user.click(pick('Тема b'))
		expect(screen.getByText(UI_ROADMAP_EDIT.LINK_TARGET)).toBeInTheDocument()
		await user.click(pick('Тема a'))
		const banner = await screen.findByText(UI_ROADMAP_EDIT.CYCLE_TITLE)
		expect(banner.parentElement).toHaveTextContent('образует цикл')
		expect(banner.closest('[role="status"]')).toBeNull()
		expect(screen.queryByText(UI_ROADMAP_EDIT.REJECT_UNDO)).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.REJECT_CLOSE }))
		expect(screen.queryByText(UI_ROADMAP_EDIT.CYCLE_TITLE)).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.ADD_STAGE }))
		await user.click(pick('Тема c'))
		await user.click(pick('Тема a'))
		await user.click(screen.getByRole('radio', { name: UI_ROADMAP_EDIT.TOOL_SELECT }))
		await user.click(screen.getByRole('radio', { name: UI_ROADMAP_EDIT.TOOL_LINK }))
		await user.click(pick('Тема b'))
		await user.click(pick('Тема a'))
		expect(await screen.findByText(UI_ROADMAP_EDIT.REJECT_UNDO)).toBeInTheDocument()
	})

	it('обработчик приложения отменил правку — плашка с текстом отказа', async () => {
		const { user } = await renderEditor({ beforeChange: () => false })
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.ADD_STAGE }))
		const title = await screen.findByText(UI_ROADMAP_EDIT.REJECT_TITLE)
		expect(title.parentElement).toHaveTextContent(UI_ROADMAP_EDIT.REJECT_HOOK)
		expect(title.closest('[role="status"]')).toBeNull()
		expect(liveText()).toContain(UI_ROADMAP_EDIT.REJECT_HOOK)
	})
})
