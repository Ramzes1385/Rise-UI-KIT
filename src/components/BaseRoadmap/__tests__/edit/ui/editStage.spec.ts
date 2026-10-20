import { mount } from '@vue/test-utils'
import { formatMessage } from '@/locales/state'
import { editData } from '../fixtures/editFixtures'
import { enableAutoUnmount } from '@vue/test-utils'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { mockWidth } from '../../fixtures/shellFixtures'
import { liveText, mountEditor } from '../fixtures/renderEditor'
import { UI_ROADMAP, UI_ROADMAP_EDIT } from '@/locales/messages'
import { fireEvent, screen, within } from '@testing-library/vue'

vi.setConfig({ testTimeout: 60_000 })
enableAutoUnmount(afterEach)

const pick = (title: string) => screen.getByRole('button', { name: new RegExp(`^${title}`) })
const inspector = () => screen.getByLabelText(UI_ROADMAP_EDIT.INSPECTOR_LABEL)
const handle = (title: string) => screen.getByRole('button', { name: new RegExp(`Перетащить (тему|этап) «${title}»`) })

describe('этап: меню, добавление темы, название', () => {
	it('«Переименовать» в меню этапа выбирает его и переводит фокус на название', async () => {
		const { user } = await mountEditor()
		await user.click(screen.getByRole('button', { name: formatMessage(UI_ROADMAP_EDIT.STAGE_ACTIONS, { title: 'Этап s2' }) }))
		await user.click(await screen.findByRole('menuitem', { name: new RegExp(UI_ROADMAP_EDIT.MENU_RENAME) }))
		await vi.waitFor(() => expect(within(inspector()).getByRole('textbox', { name: UI_ROADMAP_EDIT.F_TITLE })).toHaveFocus())
	})

	it('кнопка «Тема» внутри этапа добавляет тему именно в него', async () => {
		const { user } = await mountEditor()
		const stage = document.querySelector('[data-roadmap-stage="s3"]') as HTMLElement
		await user.click(within(stage).getByRole('button', { name: new RegExp(UI_ROADMAP_EDIT.ADD_TOPIC) }))
		await vi.waitFor(() => expect(liveText()).toContain('Добавлена тема'))
	})

	it('название выбранного этапа правится через панель свойств', async () => {
		const { user } = await mountEditor()
		await user.click(screen.getByText('Этап s2', { selector: '.base-roadmap__edit-pick-title' }))
		const title = within(inspector()).getByRole('textbox', { name: UI_ROADMAP_EDIT.F_TITLE })
		await user.clear(title)
		await user.type(title, 'Новый этап')
		await vi.waitFor(() => expect(screen.getByText('Новый этап', { selector: '.base-roadmap__edit-pick-title' })).toBeInTheDocument())
	})
})

describe('панель инструментов элемента: «Выше»', () => {
	it('кнопка «Выше» двигает тему вверх', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема b'))
		const bar = within(inspector()).getByRole('toolbar', { name: UI_ROADMAP_EDIT.ITEM_TOOLBAR })
		await user.click(within(bar).getByRole('button', { name: new RegExp(UI_ROADMAP_EDIT.ITEM_UP) }))
		await vi.waitFor(() => expect(liveText()).toContain('место 1 из 3'))
	})
})

describe('клик сразу после перетаскивания не выбирает элемент', () => {
	const original = document.elementsFromPoint
	afterEach(() => {
		document.elementsFromPoint = original
	})
	const point = (extra: Record<string, unknown>) => ({ clientX: 0, clientY: 0, pointerId: 1, pointerType: 'mouse', button: 0, ...extra })

	it('после броска темы и этапа первый клик гасится, второй выбирает', async () => {
		const { user } = await mountEditor()
		document.elementsFromPoint = () => [document.querySelector('[data-roadmap-topic="c"]') as HTMLElement]
		await fireEvent.pointerDown(handle('Тема a'), point({ clientX: 5, clientY: 5 }))
		await fireEvent.pointerMove(window, point({ clientX: 40, clientY: 80 }))
		await fireEvent.pointerUp(window, point({ clientX: 40, clientY: 80 }))
		await fireEvent.click(pick('Тема a'))
		expect(screen.getByText(UI_ROADMAP_EDIT.INSPECTOR_EMPTY)).toBeInTheDocument()
		await user.click(pick('Тема a'))
		expect(pick('Тема a')).toHaveAttribute('aria-pressed', 'true')

		document.elementsFromPoint = () => [document.querySelector('[data-roadmap-stage="s2"]') as HTMLElement]
		await fireEvent.pointerDown(handle('Этап s1'), point({ clientX: 5, clientY: 5 }))
		await fireEvent.pointerMove(window, point({ clientX: 60, clientY: 90 }))
		await fireEvent.pointerUp(window, point({ clientX: 60, clientY: 90 }))
		const title = screen.getByText('Этап s1', { selector: '.base-roadmap__edit-pick-title' })
		await fireEvent.click(title)
		expect(pick('Тема a')).toHaveAttribute('aria-pressed', 'true')
		await user.click(title)
		expect(within(inspector()).queryByRole('tab')).not.toBeInTheDocument()
	})
})

describe('вкладка «Хуки»: подписка с неизвестным именем', () => {
	it('показывается без описания', async () => {
		const { user, api } = await mountEditor()
		api.on('afterEverything' as never, function custom() {} as never)
		await user.click(pick('Тема a'))
		await user.click(within(inspector()).getByRole('tab', { name: new RegExp(UI_ROADMAP_EDIT.TAB_HOOKS) }))
		expect(within(inspector()).getByText('custom')).toBeInTheDocument()
	})
})

describe('вид нового материала и публикация в отключённом состоянии', () => {
	it('выбранный вид попадает в новый материал', async () => {
		const { user } = await mountEditor()
		await user.click(pick('Тема a'))
		await user.click(within(inspector()).getByRole('tab', { name: new RegExp(UI_ROADMAP_EDIT.TAB_MATERIALS) }))
		await user.click(within(inspector()).getByRole('combobox', { name: UI_ROADMAP_EDIT.MATERIAL_NEW_KIND }))
		await user.click(await screen.findByRole('option', { name: 'Видео' }))
		await user.click(within(inspector()).getByRole('button', { name: new RegExp(UI_ROADMAP_EDIT.ADD_MATERIAL) }))
		await vi.waitFor(() =>
			expect(within(inspector()).getByRole('combobox', { name: UI_ROADMAP_EDIT.MATERIAL_KIND })).toHaveTextContent('Видео'),
		)
	})

	it('в отключённом роадмапе публикация ничего не отдаёт', async () => {
		const onPublish = vi.fn()
		await mountEditor({ isDisabled: true, onPublish } as never)
		await fireEvent.click(screen.getByRole('button', { name: UI_ROADMAP_EDIT.PUBLISH }))
		expect(onPublish).not.toHaveBeenCalled()
	})
})

describe('отказ beforeDelete и размонтирование до загрузки', () => {
	it('отказ удаления оставляет тему выбранной, «Последний итог» виден сразу', async () => {
		const { user, api } = await mountEditor()
		api.on('beforeDelete', function guard() {
			return false
		})
		await user.click(pick('Тема c'))
		const bar = within(inspector()).getByRole('toolbar', { name: UI_ROADMAP_EDIT.ITEM_TOOLBAR })
		await user.click(within(bar).getByRole('button', { name: new RegExp(UI_ROADMAP_EDIT.ITEM_REMOVE) }))
		await vi.waitFor(() => expect(liveText()).toContain('отменена'))
		expect(pick('Тема c')).toHaveAttribute('aria-pressed', 'true')
		await user.click(within(inspector()).getByRole('tab', { name: new RegExp(UI_ROADMAP_EDIT.TAB_HOOKS) }))
		expect(within(inspector()).getByText(new RegExp(`Последний итог: отказ — ${UI_ROADMAP.HOOK_REASON_DELETE}`))).toBeInTheDocument()
	})

	it('размонтирование в режиме «Правка» до загрузки чанка ничего не запускает и не пишет в консоль', async () => {
		mockWidth(1200)
		const wrapper = mount(BaseRoadmap, { props: { data: editData(), mode: 'edit', layout: 'list' } as never, attachTo: document.body })
		wrapper.unmount()
		await new Promise(resolve => setTimeout(resolve, 3000))
		expect(document.body.querySelector('.base-roadmap')).toBeNull()
	})
})
