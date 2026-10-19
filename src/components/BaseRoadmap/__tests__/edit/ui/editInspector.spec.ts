import { formatMessage } from '@/locales/state'
import { enableAutoUnmount } from '@vue/test-utils'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { screen, within } from '@testing-library/vue'
import { liveText, mountEditor } from '../fixtures/renderEditor'
import { editData, roadmap, stage, topic } from '../fixtures/editFixtures'

vi.setConfig({ testTimeout: 60_000 })
enableAutoUnmount(afterEach)

const pick = (title: string) => screen.getByRole('button', { name: new RegExp(`^${title}`) })
const stageTitle = (title: string) => screen.getByText(title, { selector: '.base-roadmap__edit-pick-title' })
const inspector = () => screen.getByLabelText(UI_ROADMAP_EDIT.INSPECTOR_LABEL)
const tab = (name: RegExp | string) => within(inspector()).getByRole('tab', { name })
const field = (label: string) => within(inspector()).getByRole('textbox', { name: label }) as HTMLInputElement

async function choose(user: ReturnType<typeof import('@testing-library/user-event').default.setup>, label: string, option: string) {
	await user.click(within(inspector()).getByRole('combobox', { name: label }))
	await user.click(await screen.findByRole('option', { name: option }))
}

describe('панель свойств: тема', () => {
	it('выбор темы показывает её поля, «Готово» снимает выбор', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема a'))
		expect(field(UI_ROADMAP_EDIT.F_TITLE).value).toBe('Тема a')
		expect(pick('Тема a')).toHaveAttribute('aria-pressed', 'true')
		expect(within(inspector()).getByText(formatMessage(UI_ROADMAP_EDIT.EYEBROW, { n: 1, title: 'Этап s1' }))).toBeInTheDocument()
		await user.click(within(inspector()).getByRole('button', { name: UI_ROADMAP_EDIT.DONE }))
		expect(screen.getByText(UI_ROADMAP_EDIT.INSPECTOR_EMPTY)).toBeInTheDocument()
	})

	it('название правится через историю, фокус остаётся в поле', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема c'))
		const title = field(UI_ROADMAP_EDIT.F_TITLE)
		await user.clear(title)
		await user.type(title, 'Новая')
		await vi.waitFor(() => expect(pick('Новая')).toBeInTheDocument())
		expect(screen.getByLabelText(UI_ROADMAP_EDIT.STATUS_LABEL)).toHaveTextContent(/Изменений\s*[1-9]/)
		expect(title).toHaveFocus()
	})

	it('необязательная тема, описание и часы', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема c'))
		await user.click(within(inspector()).getByRole('switch', { name: UI_ROADMAP_EDIT.F_OPTIONAL }))
		await vi.waitFor(() =>
			expect(screen.getAllByRole('listitem').find(item => item.getAttribute('data-roadmap-topic') === 'c')).toHaveClass(
				'base-roadmap__edit-topic--optional',
			),
		)
		await user.type(within(inspector()).getByRole('textbox', { name: UI_ROADMAP_EDIT.F_DESCRIPTION }), 'Описание')
		const hours = within(inspector()).getByRole('spinbutton', { name: UI_ROADMAP_EDIT.F_HOURS })
		await user.type(hours, '3')
		await user.tab()
		await vi.waitFor(() => expect(screen.getByText('3 ч')).toBeInTheDocument())
	})

	it('альтернатива доступна не для первой темы', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема a'))
		expect(within(inspector()).getByRole('switch', { name: UI_ROADMAP_EDIT.F_ALTERNATIVE })).toBeDisabled()
		await user.click(pick('Тема b'))
		const alternative = within(inspector()).getByRole('switch', { name: UI_ROADMAP_EDIT.F_ALTERNATIVE })
		expect(alternative).toBeEnabled()
		await user.click(alternative)
		await vi.waitFor(() => expect(alternative).toBeChecked())
		expect(screen.getByText('или')).toBeInTheDocument()
	})

	it('перенос в другой этап через поле «Этап»', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема c'))
		await choose(user, UI_ROADMAP_EDIT.F_STAGE, 'Этап s3')
		await vi.waitFor(() => expect(liveText()).toContain('перемещена'))
		expect(within(screen.getByRole('list', { name: 'Этап s3' })).getByText('Тема c')).toBeInTheDocument()
	})

	it('«Нужно знать»: выбор темы-требования, замыкающие цикл варианты отключены', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема a'))
		await user.click(within(inspector()).getByRole('combobox', { name: UI_ROADMAP_EDIT.F_REQUIRES }))
		const cyclic = await screen.findByRole('option', { name: /Тема b/ })
		expect(cyclic).toHaveAttribute('aria-disabled', 'true')
		await user.click(screen.getByRole('option', { name: /Тема c/ }))
		await vi.waitFor(() => expect(liveText()).toContain('Изменено «Тема a»'))
	})

	it('подтемы: добавление, переименование, удаление', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема a'))
		expect(within(inspector()).getByText(UI_ROADMAP_EDIT.SUBTOPICS_EMPTY)).toBeInTheDocument()
		await user.click(within(inspector()).getByRole('button', { name: new RegExp(UI_ROADMAP_EDIT.ADD_SUBTOPIC) }))
		const input = await within(inspector()).findByRole('textbox', { name: UI_ROADMAP_EDIT.SUBTOPIC_LABEL })
		await user.clear(input)
		await user.type(input, 'Теги')
		await user.click(
			within(inspector()).getByRole('button', { name: formatMessage(UI_ROADMAP_EDIT.REMOVE_SUBTOPIC, { title: 'Теги' }) }),
		)
		await vi.waitFor(() => expect(within(inspector()).getByText(UI_ROADMAP_EDIT.SUBTOPICS_EMPTY)).toBeInTheDocument())
	})
})

describe('панель свойств: материалы', () => {
	it('вкладка показывает предупреждение, добавление материала и счётчик на вкладке', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема a'))
		await user.click(tab(new RegExp(UI_ROADMAP_EDIT.TAB_MATERIALS)))
		expect(within(inspector()).getByText(UI_ROADMAP_EDIT.MATERIALS_EMPTY)).toBeInTheDocument()
		expect(within(inspector()).getByText(UI_ROADMAP_EDIT.MATERIALS_WARN)).toBeInTheDocument()
		await user.click(within(inspector()).getByRole('button', { name: new RegExp(UI_ROADMAP_EDIT.ADD_MATERIAL) }))
		await vi.waitFor(() => expect(tab(new RegExp(`${UI_ROADMAP_EDIT.TAB_MATERIALS} 1`))).toBeInTheDocument())
		const title = within(inspector()).getByRole('textbox', { name: UI_ROADMAP_EDIT.MATERIAL_TITLE })
		await user.clear(title)
		await user.type(title, 'Лекция')
		await user.type(within(inspector()).getByRole('textbox', { name: UI_ROADMAP_EDIT.MATERIAL_URL }), 'https://x.dev')
		await choose(user, UI_ROADMAP_EDIT.MATERIAL_KIND, 'Видео')
		await user.click(
			within(inspector()).getByRole('button', { name: formatMessage(UI_ROADMAP_EDIT.REMOVE_MATERIAL, { title: 'Лекция' }) }),
		)
		await vi.waitFor(() => expect(within(inspector()).getByText(UI_ROADMAP_EDIT.MATERIALS_EMPTY)).toBeInTheDocument())
	})
})

describe('панель свойств: «Статус по умолчанию»', () => {
	it('поле показывает «не задан», меняется на «Пройдена» одним шагом, undo возвращает', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема c'))
		const select = within(inspector()).getByRole('combobox', { name: UI_ROADMAP_EDIT.F_DEFAULT_STATUS })
		expect(select).toHaveTextContent(UI_ROADMAP_EDIT.DEFAULT_STATUS_NONE)
		await choose(user, UI_ROADMAP_EDIT.F_DEFAULT_STATUS, 'Изучена')
		await vi.waitFor(() => expect(select).toHaveTextContent('Изучена'))
		expect(screen.getByLabelText(UI_ROADMAP_EDIT.STATUS_LABEL)).toHaveTextContent(/Изменений\s*1/)
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.UNDO }))
		await vi.waitFor(() => expect(select).toHaveTextContent(UI_ROADMAP_EDIT.DEFAULT_STATUS_NONE))
		await user.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.REDO }))
		await vi.waitFor(() => expect(select).toHaveTextContent('Изучена'))
		await choose(user, UI_ROADMAP_EDIT.F_DEFAULT_STATUS, UI_ROADMAP_EDIT.DEFAULT_STATUS_NONE)
		await vi.waitFor(() => expect(select).toHaveTextContent(UI_ROADMAP_EDIT.DEFAULT_STATUS_NONE))
	})

	it('изначальное значение из данных показывается в поле', async () => {
		const { user } = await mountEditor({ data: roadmap([stage('s', [topic('a', { defaultStatus: 'in-progress' })])]) })
		await user.click(pick('Тема a'))
		expect(within(inspector()).getByRole('combobox', { name: UI_ROADMAP_EDIT.F_DEFAULT_STATUS })).toHaveTextContent('В процессе')
	})
})

describe('панель свойств: этап и кнопки элемента', () => {
	it('выбор этапа показывает поля этапа без вкладок', async () => {
		const { user } = await mountEditor()
		await user.click(stageTitle('Этап s2'))
		expect(within(inspector()).queryByRole('tab')).not.toBeInTheDocument()
		expect(field(UI_ROADMAP_EDIT.F_TITLE).value).toBe('Этап s2')
		await user.click(within(inspector()).getByRole('switch', { name: UI_ROADMAP_EDIT.F_OPTIONAL }))
		await vi.waitFor(() => expect(liveText()).toContain('Изменено «Этап s2»'))
		await user.type(within(inspector()).getByRole('textbox', { name: UI_ROADMAP_EDIT.F_DESCRIPTION }), 'О')
		await user.click(within(inspector()).getByRole('combobox', { name: UI_ROADMAP_EDIT.F_REQUIRES }))
		await user.click(await screen.findByRole('option', { name: 'Этап s3' }))
	})

	it('кнопки «Выше/Ниже» двигают тему, на краю недоступны', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема a'))
		const bar = within(inspector()).getByRole('toolbar', { name: UI_ROADMAP_EDIT.ITEM_TOOLBAR })
		expect(within(bar).getByRole('button', { name: new RegExp(UI_ROADMAP_EDIT.ITEM_UP) })).toBeDisabled()
		await user.click(within(bar).getByRole('button', { name: new RegExp(UI_ROADMAP_EDIT.ITEM_DOWN) }))
		await vi.waitFor(() => expect(liveText()).toContain('место 2 из 3'))
		await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Перетащить тему «Тема a»' })).toHaveFocus())
	})

	it('«Дублировать» и «Удалить» в панели работают над выбранным', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема c'))
		const bar = within(inspector()).getByRole('toolbar', { name: UI_ROADMAP_EDIT.ITEM_TOOLBAR })
		await user.click(within(bar).getByRole('button', { name: new RegExp(UI_ROADMAP_EDIT.ITEM_DUPLICATE) }))
		await vi.waitFor(() => expect(screen.getByText(/Тема c \(копия\)/)).toBeInTheDocument())
		await user.click(within(bar).getByRole('button', { name: new RegExp(UI_ROADMAP_EDIT.ITEM_REMOVE) }))
		await vi.waitFor(() => expect(screen.getByText(UI_ROADMAP_EDIT.INSPECTOR_EMPTY)).toBeInTheDocument())
		expect(screen.queryByRole('button', { name: /^Тема c$/ })).not.toBeInTheDocument()
	})

	it('нижняя кнопка «Удалить тему» удаляет, «Удалить этап» с темами просит подтверждение', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема d'))
		await user.click(within(inspector()).getByRole('button', { name: UI_ROADMAP_EDIT.REMOVE_TOPIC }))
		await vi.waitFor(() => expect(screen.queryByRole('button', { name: /^Тема d/ })).not.toBeInTheDocument())
		await user.click(stageTitle('Этап s2'))
		await user.click(within(inspector()).getByRole('button', { name: UI_ROADMAP_EDIT.REMOVE_STAGE }))
		const dialog = await screen.findByRole('alertdialog')
		expect(dialog).toHaveTextContent('Этап s2')
		await user.click(within(dialog).getByRole('button', { name: UI_ROADMAP_EDIT.CONFIRM_STAGE_OK }))
		await vi.waitFor(() => expect(screen.queryByRole('button', { name: /Этап 2, Этап s2/ })).not.toBeInTheDocument())
		expect(screen.getByText(UI_ROADMAP_EDIT.INSPECTOR_EMPTY)).toBeInTheDocument()
	})
})

describe('вкладка «Хуки»', () => {
	const openHooks = async (user: Awaited<ReturnType<typeof mountEditor>>['user']) => {
		await user.click(pick('Тема a'))
		await user.click(tab(new RegExp(UI_ROADMAP_EDIT.TAB_HOOKS)))
	}
	function checkAccess() {
		return undefined
	}
	function refuse() {
		return false
	}

	it('без подписок: счётчик 0 и пустое состояние', async () => {
		const { user } = await mountEditor()
		await openHooks(user)
		expect(tab(`${UI_ROADMAP_EDIT.TAB_HOOKS} 0`)).toBeInTheDocument()
		expect(within(inspector()).getByText(UI_ROADMAP_EDIT.HOOKS_EMPTY)).toBeInTheDocument()
		expect(within(inspector()).getByText(UI_ROADMAP_EDIT.HOOKS_INTRO)).toBeInTheDocument()
	})

	it('показывает подписки из пропсов и ref.on, скрывает внутренние, считает включённые', async () => {
		const { user, api } = await mountEditor({ beforeChange: checkAccess, beforeDelete: function auditDelete() {} })
		function secretInternal() {}
		api.on('beforeChange', secretInternal)
		api.on('beforeStatusChange', function trackStatus() {})
		await openHooks(user)
		const pane = within(inspector())
		expect(tab(`${UI_ROADMAP_EDIT.TAB_HOOKS} 3`)).toBeInTheDocument()
		expect(pane.getByText('checkAccess')).toBeInTheDocument()
		expect(pane.getByText('auditDelete')).toBeInTheDocument()
		expect(pane.getByText('trackStatus')).toBeInTheDocument()
		expect(pane.queryByText('secretInternal')).not.toBeInTheDocument()
		expect(pane.getAllByText(UI_ROADMAP_EDIT.HOOK_CANCELLABLE)).toHaveLength(3)
		expect(pane.getByText(UI_ROADMAP_EDIT.HOOK_D_DELETE)).toBeInTheDocument()
		expect(pane.getByText(UI_ROADMAP_EDIT.HOOK_D_STATUS)).toBeInTheDocument()
		expect(pane.getAllByText('вызван 0').length).toBeGreaterThan(0)
	})

	it('анонимная функция подписывается под подписью «анонимная функция»', async () => {
		const { user, api } = await mountEditor()
		api.on('beforeChange', [() => undefined][0])
		await openHooks(user)
		expect(within(inspector()).getByText(UI_ROADMAP_EDIT.HOOK_ANONYMOUS)).toBeInTheDocument()
		expect(within(inspector()).getByRole('switch', { name: new RegExp(UI_ROADMAP_EDIT.HOOK_ANONYMOUS) })).toBeChecked()
	})

	it('выключенный обработчик не вызывается, счётчик вкладки уменьшается', async () => {
		const spy = vi.fn()
		const { user, api } = await mountEditor()
		api.on('beforeChange', function watcher() {
			spy()
		})
		await openHooks(user)
		const toggle = within(inspector()).getByRole('switch', { name: /beforeChange/ })
		await user.click(toggle)
		expect(toggle).not.toBeChecked()
		expect(tab(`${UI_ROADMAP_EDIT.TAB_HOOKS} 0`)).toBeInTheDocument()
		await api.update('b', { title: 'Первая' })
		expect(spy).not.toHaveBeenCalled()
		await user.click(toggle)
		expect(tab(`${UI_ROADMAP_EDIT.TAB_HOOKS} 1`)).toBeInTheDocument()
		await api.update('b', { title: 'Вторая' })
		expect(spy).toHaveBeenCalledOnce()
	})

	it('«Последний итог» сразу после отказа и после разрешения', async () => {
		let isAllowed = false
		const { user, api } = await mountEditor()
		api.on('beforeChange', function gate() {
			return isAllowed
		})
		await openHooks(user)
		const pane = within(inspector())
		expect(pane.queryByText(/Последний итог/)).not.toBeInTheDocument()
		await api.update('b', { title: 'Первая' })
		await vi.waitFor(() => expect(pane.getByText(/Последний итог: отказ — правка «update» отменена/)).toBeInTheDocument())
		expect(pane.getByText('вызван 1')).toBeInTheDocument()
		isAllowed = true
		await api.update('b', { title: 'Вторая' })
		await vi.waitFor(() => expect(pane.getByText(/Последний итог: разрешено/)).toBeInTheDocument())
		expect(pane.getByText('вызван 2')).toBeInTheDocument()
	})

	it('список обновляется при смене пропса и отписке', async () => {
		const { user, api, wrapper } = await mountEditor({ beforeChange: refuse })
		const off = api.on('beforeDelete', function later() {})
		await openHooks(user)
		const pane = within(inspector())
		expect(pane.getByText('refuse')).toBeInTheDocument()
		await wrapper.setProps({ beforeChange: checkAccess })
		await vi.waitFor(() => expect(pane.getByText('checkAccess')).toBeInTheDocument())
		expect(pane.queryByText('refuse')).not.toBeInTheDocument()
		off()
		await vi.waitFor(() => expect(pane.queryByText('later')).not.toBeInTheDocument())
		await wrapper.setProps({ beforeChange: undefined })
		await vi.waitFor(() => expect(pane.getByText(UI_ROADMAP_EDIT.HOOKS_EMPTY)).toBeInTheDocument())
	})

	it('переключатели недоступны при isDisabled', async () => {
		const { user } = await mountEditor({ beforeChange: checkAccess, isDisabled: true })
		await user.click(screen.getByRole('button', { name: 'Перетащить тему «Тема a»' }).nextElementSibling as HTMLElement)
		expect(editData().stages).toHaveLength(3)
	})
})
