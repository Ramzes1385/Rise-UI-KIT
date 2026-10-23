import '@testing-library/jest-dom/vitest'
import { reactive } from 'vue'
import { fireEvent, within } from '@testing-library/vue'
import { getFlowEditing } from '../../../model/edit/useFlowEditing'
import { guardConsole } from '../../helpers/consoleGuard.test-utils'
import { useFlowEditMenu } from '../../../model/edit/overlay/useFlowEditMenu'
import { commitLabel, startLabel } from '../../../model/edit/panels/editLabel'
import { useFlowEditData } from '../../../model/edit/inspector/useFlowEditData'
import { useFlowEditLabel } from '../../../model/edit/overlay/useFlowEditLabel'
import { useFlowEditField } from '../../../model/edit/inspector/useFlowEditField'
import { useFlowEditStyle } from '../../../model/edit/inspector/useFlowEditStyle'
import { useFlowEditConnect } from '../../../model/edit/overlay/useFlowEditConnect'
import { useFlowEditPending } from '../../../model/edit/overlay/useFlowEditPending'
import { useFlowEditInspector } from '../../../model/edit/inspector/useFlowEditInspector'
import { bareNotation, editData, flush, mountEdit, screen, settle, waitFor, type EditMap } from '../editHarness'
import { edgeFields, groupFields, manyFields, mapFields, nodeFields } from '../../../model/edit/inspector/editFields'

guardConsole()

const node = (map: EditMap, id: string) => map.data().nodes.find(item => item.id === id)!

describe('поля панели свойств напрямую', () => {
	it('поле «Нотация» только для чтения: запись ничего не делает; вид связи без kind берёт вид по умолчанию', async () => {
		const map = await mountEdit({ data: editData() })
		const { context } = await map.probe(scope => scope)
		const notation = mapFields(context).find(field => field.id === 'notation')!
		expect(notation.isDisabled).toBe(true)
		expect(notation.commit('что-то')).toBeUndefined()
		const fields = edgeFields(context, { id: 'x', source: 'gw', target: 's1' })
		expect(fields.find(field => field.id === 'kind')?.value).toBe('call')
		expect(map.controller.getHistory().canUndo).toBe(false)
	})

	it('нотация без видов групп и без раскладки: поля группы, направление «слева направо», карта без групп', async () => {
		const bare = bareNotation()
		const map = await mountEdit({ data: editData({ notation: 'bare' }), notations: [bare as never] })
		const { context } = await map.probe(scope => scope)
		const group = groupFields(context, { id: 'z1', kind: 'zone', label: 'Ядро' })
		expect(group.find(field => field.id === 'kind')?.options).toEqual([])
		expect(mapFields(context).find(field => field.id === 'direction')?.value).toBe('LR')
		expect(manyFields(context, ['gw', 'db'])).toHaveLength(2)
		expect(nodeFields(context, node(map, 'gw')).length).toBeGreaterThan(3)
	})

	it('в карте без групп список «Дорожка» состоит из «Без дорожки»', async () => {
		const map = await mountEdit({ data: { version: 1, nodes: [{ id: 'gw', kind: 'gateway', label: 'Шлюз' }], edges: [] } })
		const { context } = await map.probe(scope => scope)
		const options = nodeFields(context, node(map, 'gw')).find(field => field.id === 'group')?.options
		expect(options).toEqual([{ value: '', label: 'Без дорожки' }])
	})
})

describe('части панели свойств напрямую', () => {
	it('данные: удаление поля у узла без полей не падает', async () => {
		const map = await mountEdit({ data: editData() })
		await map.probe(() => useFlowEditData({ id: 's2' }).remove('нет'))
		await waitFor(() => expect(node(map, 's2').fields).toEqual([]))
	})

	it('стиль: адрес пуст без модели, сброс адреса пишет пустое значение, свой GLB берёт текущий адрес', async () => {
		const map = await mountEdit({ data: editData() })
		const style = await map.probe(() => useFlowEditStyle({ id: 's1' }))
		expect(style.url.value).toBe('')
		style.setUrl(null)
		await waitFor(() => expect(node(map, 's1').model3d).toEqual({ url: '' }))
		style.setModel('gateway')
		await waitFor(() => expect(node(map, 's1').model3d).toEqual({ model: 'gateway', url: undefined }))
		style.setModel('custom')
		await waitFor(() => expect(node(map, 's1').model3d).toEqual({ model: 'gateway', url: '' }))
		style.setUrl('/a.glb')
		await waitFor(() => expect(node(map, 's1').model3d?.url).toBe('/a.glb'))
		style.setModel('custom')
		await flush()
		expect(node(map, 's1').model3d?.url).toBe('/a.glb')
	})

	it('поле: значение, пропавшее снаружи, очищает черновик; сохранение пустого значения не пишет', async () => {
		const map = await mountEdit({ data: editData() })
		const props = reactive({ field: { id: 'f', type: 'text', label: 'Поле', value: 'a' as string | undefined, commit: vi.fn() } })
		const state = await map.probe(() => useFlowEditField(props as never))
		expect(state.draft.value).toBe('a')
		props.field.value = undefined
		await settle()
		expect(state.draft.value).toBe('')
		state.draft.value = 'новое'
		state.save()
		expect(props.field.commit).toHaveBeenCalledWith('новое')
		expect(state.options()).toEqual([])
		state.number(4)
		expect(props.field.commit).toHaveBeenCalledWith(4)
	})

	it('инспектор без нескольких выделенных: счётчик пуст, вкладка «Стиль» возвращается в «Свойства» на связи', async () => {
		const map = await mountEdit({ data: editData() })
		const inspector = await map.probe(() => useFlowEditInspector())
		expect(inspector.count.value).toBe('')
		inspector.tab.value = 'style'
		expect(inspector.tab.value).toBe('style')
		map.controller.select(['e1'])
		await settle()
		expect(inspector.tab.value).toBe('props')
	})
})

describe('окна правки напрямую', () => {
	it('соединение: цель без места в раскладке соединяется без индикатора ожидания', async () => {
		const map = await mountEdit({ data: editData() })
		const connect = await map.probe(() => useFlowEditConnect())
		const { context } = await map.probe(scope => scope)
		context.env.state.linkFrom.value = 'gw'
		connect.choose('ghost')
		await settle()
		await flush()
		expect(context.env.state.linkFrom.value).toBeNull()
		expect(context.env.state.link.value).toBeNull()
		expect(map.data().edges).toHaveLength(2)
	})

	it('соединение: без источника целей нет, выбор пустого значения ничего не делает, подпись отказа, якорь без области', async () => {
		const map = await mountEdit({ data: editData() })
		const connect = await map.probe(() => useFlowEditConnect())
		expect(connect.options.value).toEqual([])
		expect(connect.anchor.value).toEqual({ x: 0, y: 0 })
		expect(connect.describe('Оплата', 'нельзя')).toBe('Оплата — нельзя: нельзя')
		connect.choose(null)
		expect(map.data().edges).toHaveLength(2)
		const { context } = await map.probe(scope => scope)
		context.env.state.linkFrom.value = 'gw'
		expect(connect.anchor.value.x).toBeGreaterThan(0)
		const element = context.env.element as { value: HTMLElement | null }
		const kept = element.value
		element.value = null
		expect(connect.anchor.value.x).toBeGreaterThan(0)
		element.value = kept
		context.env.state.linkFrom.value = null
	})

	it('подпись: без черновика стиль пуст, cancel закрывает поле', async () => {
		const map = await mountEdit({ data: editData() })
		const label = await map.probe(() => useFlowEditLabel())
		expect(label.style.value).toEqual({})
		const { context } = await map.probe(scope => scope)
		startLabel(context, { entity: 'node', id: 'gw' })
		await settle()
		expect(label.style.value).toMatchObject({ width: '160px' })
		label.cancel()
		expect(context.env.state.label.value).toBeNull()
	})

	it('подпись: нет рамки у группы, связи и сценария — поле не открывается; сценарий не сохраняется', async () => {
		const map = await mountEdit({ data: editData() })
		const { context } = await map.probe(scope => scope)
		startLabel(context, { entity: 'group', id: 'нет' })
		startLabel(context, { entity: 'edge', id: 'нет' })
		startLabel(context, { entity: 'scenario', id: 'нет' })
		expect(context.env.state.label.value).toBeNull()
		context.env.state.label.value = {
			target: { entity: 'scenario', id: 's' },
			box: { x: 0, y: 0, width: 1, height: 1 },
			value: 'a',
			isMultiline: false,
		}
		await commitLabel(context, 'b')
		expect(map.controller.getHistory().canUndo).toBe(false)
	})

	it('меню: «Соединить с…» без выделения пишет пустой источник; меню закрывается при выходе из режима', async () => {
		const map = await mountEdit({ data: editData() })
		const menu = await map.probe(() => useFlowEditMenu())
		const { context } = await map.probe(scope => scope)
		map.controller.select([])
		const connect = menu.items.value[0][1]
		connect.onSelect?.(undefined as never)
		expect(context.env.state.linkFrom.value).toBeNull()
		context.env.state.menu.value = { x: 1, y: 1, target: null }
		await settle()
		await map.rerender({ mode: 'view' })
		await settle()
		expect(context.env.state.menu.value).toBeNull()
	})

	it('ожидание ответа: вне ожидания стиль указывает в начало', async () => {
		const map = await mountEdit({ data: editData() })
		const pending = await map.probe(() => useFlowEditPending())
		expect(pending.isPending.value).toBe(false)
		expect(pending.style.value).toEqual({ left: '8px', top: '8px' })
	})

	it('getFlowEditing без состояния правки сообщает об ошибке', () => {
		expect(() => getFlowEditing({})).toThrow('BaseFlowMap: edit state is missing')
	})
})

describe('прочие уголки', () => {
	it('reject без текста и reject вне режима правки не показывают уведомлений', async () => {
		const map = await mountEdit({ data: editData() })
		const { model } = await map.probe(scope => scope)
		model.events.emit('reject', { command: 'x', by: 'rule' })
		await settle()
		expect(screen.getByRole('status', { name: 'Уведомления правки' }).textContent).toBe('')
		const view = await mountEdit({ data: editData(), mode: 'view', beforeCreate: () => false })
		await view.controller.addNode({ id: 'n', kind: 'service', label: 'N' })
		await settle()
		expect(screen.getAllByRole('status', { name: 'Уведомления правки' }).every(item => item.textContent === '')).toBe(true)
	})

	it('замечание уровня «ошибка» и нотация без пояснения правил', async () => {
		const bare = bareNotation({
			validate: () => [{ level: 'error', code: 'bad', message: 'Плохая карта', target: { entity: 'node', id: 'gw' } }],
		})
		const map = await mountEdit({ data: editData({ notation: 'bare' }), notations: [bare as never] })
		const status = screen.getByRole('status', { name: 'Состояние правки' })
		await fireEvent.click(within(status).getByRole('button', { name: /замечаний 1/ }))
		const panel = screen.getByRole('dialog', { name: 'Замечания проверки' })
		expect(within(panel).getByText('ошибка')).toBeInTheDocument()
		expect(within(panel).getByText('Плохая карта')).toBeInTheDocument()
		expect(panel.querySelector('.base-flow-map__edit-hint')).toBeNull()
		await fireEvent.click(within(panel).getByRole('button', { name: 'Показать' }))
		await flush()
		await screen.findByRole('textbox', { name: 'Название' }).catch(() => undefined)
		void map
	})

	it('в нотации без заметки клавиша T и инструмент «Заметка» не работают; Enter без инструмента «Узел» ничего не добавляет', async () => {
		const bare = bareNotation()
		const noNote = { ...bare, nodeKinds: Object.fromEntries(Object.entries(bare.nodeKinds).filter(([id]) => id !== 'note')) }
		const map = await mountEdit({
			data: editData({ notation: 'bare', nodes: editData().nodes.filter(item => item.kind !== 'note') }),
			notations: [noNote as never],
		})
		await map.press('t')
		await map.press('Enter')
		expect(map.data().nodes).toHaveLength(4)
		const { context } = await map.probe(scope => scope)
		context.env.state.tool.value = 'note'
		await map.click(map.root, [600, 500])
		expect(map.data().nodes).toHaveLength(4)
		expect(screen.queryByRole('button', { name: 'Заметка, T' })).toBeNull()
	})
})
