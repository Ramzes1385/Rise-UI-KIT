import { vi } from 'vitest'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { mountEdit, roadmap, stage, topic } from '../fixtures/editFixtures'
import { useRoadmapEditor } from '../../../model/edit/editor/useRoadmapEditor'

function setup(props?: Parameters<typeof mountEdit>[0]) {
	const mounted = mountEdit(props)
	const focusTitle = vi.fn()
	const editor = useRoadmapEditor(mounted.edit, focusTitle)
	return { ...mounted, editor, focusTitle }
}

describe('useRoadmapEditor: состояние поверхности', () => {
	it('счётчики подвала: этапы, темы, действительные шаги истории и замечания', async () => {
		const { editor, edit } = setup()
		expect(editor.counts.value).toMatchObject({ stages: 3, topics: 5, changes: 0 })
		const issuesBefore = editor.counts.value.issues
		expect(issuesBefore).toBeGreaterThanOrEqual(5)
		await edit.update('a', { materials: [{ title: 'M', kind: 'doc' }] })
		expect(editor.counts.value.changes).toBe(1)
		expect(editor.counts.value.issues).toBe(issuesBefore - 1)
		edit.undo()
		expect(editor.counts.value.changes).toBe(0)
	})

	it('этапы раскрываются, сворачиваются по одному и все сразу', () => {
		const { editor } = setup()
		expect(editor.isExpanded('s1')).toBe(true)
		editor.toggleStage('s1')
		expect(editor.isExpanded('s1')).toBe(false)
		editor.expandStage('s1')
		expect(editor.isExpanded('s1')).toBe(true)
		editor.collapseAll()
		expect(['s1', 's2', 's3'].map(editor.isExpanded)).toEqual([false, false, false])
		editor.toggleStage('s2')
		expect(editor.isExpanded('s2')).toBe(true)
		editor.expandAll()
		expect(editor.isExpanded('s1')).toBe(true)
	})

	it('смена инструмента сбрасывает начало связи', () => {
		const { editor } = setup()
		editor.linkFrom.value = 'a'
		editor.setTool('link')
		expect(editor.tool.value).toBe('link')
		expect(editor.linkFrom.value).toBeNull()
	})

	it('savedText: пусто для null, undefined и неверной даты, иначе время часы:минуты', () => {
		const { editor } = setup()
		expect(editor.savedText(null)).toBe('')
		expect(editor.savedText(undefined)).toBe('')
		expect(editor.savedText('не дата')).toBe('')
		expect(editor.savedText(new Date(2026, 9, 19, 0, 52))).toMatch(/^0?0[:.]52$/)
		expect(editor.savedText(new Date(2026, 9, 19, 14, 5).getTime())).toMatch(/14[:.]05/)
	})
})

describe('useRoadmapEditor: выбор и связи', () => {
	it('в режиме выбора активация выделяет элемент', () => {
		const { editor } = setup()
		editor.activate('b')
		expect(editor.inspector.targetId.value).toBe('b')
	})

	it('инструмент «Связь»: первая тема — начало и объявление, вторая — связь, повтор той же и этап игнорируются', async () => {
		const { editor, edit, data } = setup()
		editor.setTool('link')
		editor.activate('s1')
		expect(editor.linkFrom.value).toBeNull()
		editor.activate('ghost')
		expect(editor.linkFrom.value).toBeNull()
		editor.activate('c')
		expect(editor.linkFrom.value).toBe('c')
		expect(edit.liveText.value).toBe('Связь от «Тема c»: выберите тему, которой она нужна')
		editor.activate('c')
		expect(editor.linkFrom.value).toBe('c')
		editor.activate('d')
		expect(editor.linkFrom.value).toBeNull()
		await vi.waitFor(() => expect(data.value.stages[1].topics[0].requires).toEqual(['c']))
		expect(editor.inspector.targetId.value).toBeNull()
	})

	it('клавиша onKeydown передаёт событие обработчику клавиш', () => {
		const { editor, focusTitle } = setup()
		const event = new KeyboardEvent('keydown', { key: 'F2', cancelable: true })
		editor.onKeydown(event)
		expect(focusTitle).toHaveBeenCalledOnce()
		expect(event.defaultPrevented).toBe(true)
		expect(editor.focusTitle).toBe(focusTitle)
	})
})

describe('useRoadmapEditor: добавление и удаление', () => {
	it('addStage выделяет новый этап и вставляет его после выбранного', async () => {
		const { editor, data } = setup()
		await editor.addStage()
		expect(data.value.stages.map(item => item.id)).toEqual(['s1', 's2', 's3', 'stage-1'])
		expect(editor.inspector.targetId.value).toBe('stage-1')
		editor.inspector.select('s1')
		await editor.addStage()
		expect(data.value.stages.map(item => item.id)).toEqual(['s1', 'stage-2', 's2', 's3', 'stage-1'])
	})

	it('addTopic: в заданный этап, в этап выбранного, в последний; без этапов — ничего', async () => {
		const { editor, data } = setup()
		await editor.addTopic('s2')
		expect(data.value.stages[1].topics.at(-1)?.id).toBe('topic-1')
		expect(editor.inspector.targetId.value).toBe('topic-1')
		editor.inspector.select('a')
		await editor.addTopic()
		expect(data.value.stages[0].topics.at(-1)?.id).toBe('topic-2')
		editor.inspector.select(null)
		await editor.addTopic()
		expect(data.value.stages[2].topics.map(item => item.id)).toEqual(['topic-3'])
		const empty = setup({ data: roadmap([]) })
		await empty.editor.addTopic()
		expect(empty.edit.history.list()).toEqual([])
	})

	it('отказ при добавлении не выделяет ничего', async () => {
		const { editor } = setup({ data: roadmap([stage('s', [])]), isDisabled: true })
		await editor.addStage()
		await editor.addTopic()
		expect(editor.inspector.targetId.value).toBeNull()
	})

	it('duplicate: подпись по теме, по этапу и по неизвестному id', async () => {
		const { editor, edit } = setup()
		expect(await editor.duplicate('a')).toBe(true)
		expect(await editor.duplicate('s3')).toBe(true)
		expect(await editor.duplicate('ghost')).toBe(false)
		expect(edit.history.list().map(item => item.label)).toEqual(['Дублировано «Тема a»', 'Дублировано «Этап s3»'])
	})

	it('requestRemove: тема и пустой этап удаляются сразу и снимают выделение, неизвестный id — ничего', async () => {
		const { editor, data } = setup()
		editor.requestRemove('ghost')
		editor.inspector.select('a')
		editor.requestRemove('a')
		await vi.waitFor(() => expect(data.value.stages[0].topics.map(item => item.id)).toEqual(['b', 'c']))
		await vi.waitFor(() => expect(editor.inspector.targetId.value).toBeNull())
		editor.inspector.select('b')
		editor.requestRemove('s3')
		await vi.waitFor(() => expect(data.value.stages).toHaveLength(2))
		expect(editor.inspector.targetId.value).toBe('b')
		expect(editor.pending.value).toBeNull()
	})

	it('этап с темами ждёт подтверждения; отмена ничего не удаляет, подтверждение удаляет и снимает выделение', async () => {
		const { editor, data } = setup()
		editor.inspector.select('s1')
		editor.requestRemove('s1')
		expect(editor.pending.value).toEqual({ kind: 'stage', id: 's1', title: 'Этап s1', topics: 3 })
		editor.resolve(false)
		expect(editor.pending.value).toBeNull()
		expect(data.value.stages).toHaveLength(3)
		editor.requestRemove('s1')
		editor.resolve(true)
		await vi.waitFor(() => expect(data.value.stages.map(item => item.id)).toEqual(['s2', 's3']))
		expect(editor.inspector.targetId.value).toBeNull()
		editor.requestRemove('s2')
		editor.inspector.select('s3')
		await editor.confirm()
		expect(editor.inspector.targetId.value).toBe('s3')
		expect(data.value.stages.map(item => item.id)).toEqual(['s3'])
		await editor.confirm()
	})
})

describe('useRoadmapEditor: шаблоны', () => {
	const whole = { id: 'whole', title: 'Весь путь', data: roadmap([stage('n', [topic('x')])], { title: 'Шаблонный' }) }

	it('шаблон с данными поверх непустого пути ждёт подтверждения, поверх пустого применяется сразу', async () => {
		const filled = setup({ data: roadmap([stage('s', [])]), templates: [whole] })
		filled.editor.requestTemplate('whole')
		expect(filled.editor.pending.value).toEqual({ kind: 'template', id: 'whole', title: 'Весь путь' })
		await filled.editor.confirm()
		expect(filled.data.value.title).toBe('Шаблонный')
		const empty = setup({ data: roadmap([]), templates: [whole] })
		empty.editor.requestTemplate('whole')
		await vi.waitFor(() => expect(empty.data.value.title).toBe('Шаблонный'))
		expect(empty.editor.pending.value).toBeNull()
	})

	it('шаблон этапа или темы вставляется после выбранного этапа без вопросов', async () => {
		const { editor, data } = setup()
		editor.requestTemplate('stage')
		await vi.waitFor(() => expect(data.value.stages).toHaveLength(4))
		expect(data.value.stages[3].title).toBe(UI_ROADMAP_EDIT.NEW_STAGE)
		editor.inspector.select('s1')
		editor.requestTemplate('stage')
		await vi.waitFor(() => expect(data.value.stages).toHaveLength(5))
		expect(data.value.stages[1].title).toBe(UI_ROADMAP_EDIT.NEW_STAGE)
		editor.requestTemplate('нет-такого')
	})
})
