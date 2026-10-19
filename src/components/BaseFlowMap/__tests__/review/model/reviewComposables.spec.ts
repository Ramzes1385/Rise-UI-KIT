import { nextTick } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { useFlowReviewState } from '../../../model/review/useFlowReviewState'
import { useFlowReviewPins } from '../../../model/review/bar/useFlowReviewPins'
import { useFlowReviewStatus } from '../../../model/review/bar/useFlowReviewStatus'
import { useFlowCommentList } from '../../../model/review/panel/useFlowCommentList'
import { useFlowVersionList } from '../../../model/review/panel/useFlowVersionList'
import { useFlowReviewCompare } from '../../../model/review/bar/useFlowReviewCompare'
import { useFlowSuggestionList } from '../../../model/review/panel/useFlowSuggestionList'
import { BORIS, createContextHarness, moveB, renameA, suggestion } from '../fixtures/reviewHarness'

describe('useFlowReviewState', () => {
	it('внутри карты отдаёт состояние «Правок» этой карты', () => {
		const { result, state } = createContextHarness(() => useFlowReviewState())
		expect(result).toBe(state)
	})
})

describe('useFlowCommentList', () => {
	const thread = (id: string, comments = [{ id: `c-${id}`, author: BORIS, text: 'Текст', date: 1 }]) => ({
		id,
		target: { entity: 'node' as const, id: 'a' },
		comments,
	})

	it('без выбранного элемента: подпись поля с пустым именем, отправка ничего не делает, писать нельзя', async () => {
		const { result, eventsOf } = createContextHarness(() => useFlowCommentList())
		expect(result.canComment.value).toBe(false)
		expect(result.composerLabel.value).toBe(formatMessage(UI_FLOW_REVIEW.COMMENT_ON, { name: '' }))
		result.draft.value = 'Текст'
		result.send()
		expect(eventsOf('update:comments')).toEqual([])
		expect(result.draft.value).toBe('Текст')
	})

	it('пустой текст у выбранного элемента: цепочка не создаётся, черновик остаётся', () => {
		const { result, model, eventsOf } = createContextHarness(() => useFlowCommentList())
		model.controller.select(['a'])
		result.draft.value = '   '
		result.send()
		expect(eventsOf('update:comments')).toEqual([])
		expect(result.draft.value).toBe('   ')
	})

	it('выбранный элемент: подпись по имени, отправка создаёт цепочку и очищает черновик', () => {
		const { result, model, eventsOf } = createContextHarness(() => useFlowCommentList())
		model.controller.select(['a'])
		expect(result.composerLabel.value).toBe(formatMessage(UI_FLOW_REVIEW.COMMENT_ON, { name: 'Alpha' }))
		result.draft.value = 'Вопрос'
		result.send()
		expect(result.draft.value).toBe('')
		expect(eventsOf('comment')).toHaveLength(1)
		expect(result.items.value).toHaveLength(1)
		expect(result.isEmpty.value).toBe(false)
	})

	it('цепочка без комментариев: пустые текст и время', () => {
		const { result } = createContextHarness(() => useFlowCommentList(), { comments: [thread('t1', [])] })
		expect(result.items.value[0]).toMatchObject({ text: '', time: '', count: 0 })
	})

	it('toggle раскрывает и сворачивает цепочку', () => {
		const { result, state } = createContextHarness(() => useFlowCommentList(), { comments: [thread('t1')] })
		const [first] = result.items.value
		result.toggle(first.thread)
		expect(state.comments.activeId.value).toBe('t1')
		expect(result.items.value[0].isOpen).toBe(true)
		result.toggle(first.thread)
		expect(state.comments.activeId.value).toBeNull()
	})

	it('reply и resolve из карточки, подпись кнопки зависит от состояния', () => {
		const { result, state, eventsOf } = createContextHarness(() => useFlowCommentList(), { comments: [thread('t1')] })
		const [first] = result.items.value
		expect(result.resolveLabel(first.thread)).toBe(UI_FLOW_REVIEW.RESOLVE)
		result.reply(first.thread, { parentId: null, text: 'Ответ' })
		result.resolve(state.comments.list.value[0])
		expect(result.resolveLabel(state.comments.list.value[0])).toBe(UI_FLOW_REVIEW.REOPEN)
		expect((eventsOf('comment') as { action: string }[]).map(item => item.action)).toEqual(['reply', 'resolve'])
	})

	it('show: у цепочки с элементом — фокус на нём, у точки на холсте — ничего', () => {
		const { result, model } = createContextHarness(() => useFlowCommentList(), {
			comments: [thread('t1'), { id: 't2', point: { x: 1, y: 1 }, comments: [] }],
		})
		const focus = vi.spyOn(model.controller, 'focus')
		expect(result.show(result.items.value[1].thread)).toBeUndefined()
		expect(focus).not.toHaveBeenCalled()
		result.show(result.items.value[0].thread)
		expect(focus).toHaveBeenCalledWith('a')
	})
})

describe('useFlowSuggestionList', () => {
	it('show: неизвестное предложение ничего не делает', () => {
		const { result, model } = createContextHarness(() => useFlowSuggestionList(), { suggestions: [suggestion('s1', [moveB])] })
		const focus = vi.spyOn(model.controller, 'focus')
		result.show('нет такого')
		expect(focus).not.toHaveBeenCalled()
		result.show('s1')
		expect(focus).toHaveBeenCalledWith('b')
	})

	it('setFocus ставит и снимает подсветку; «Принять все» озаглавлено числом', async () => {
		const { result, state } = createContextHarness(() => useFlowSuggestionList(), {
			suggestions: [suggestion('s1', [renameA]), suggestion('s2', [moveB])],
		})
		result.setFocus('s2')
		expect(state.suggestions.focusId.value).toBe('s2')
		expect(result.items.value.find(item => item.isFocused)?.id).toBe('s2')
		result.setFocus(null)
		expect(state.suggestions.focusId.value).toBeNull()
		expect(result.canAcceptAll.value).toBe(true)
		expect(result.acceptAllLabel.value).toBe('Принять все: 2')
		expect(await result.acceptAll()).toBe(2)
		expect(result.canAcceptAll.value).toBe(false)
		expect(result.isEmpty.value).toBe(false)
	})
})

describe('useFlowReviewStatus', () => {
	it('подпись кнопки хуков следует за числом привязок', () => {
		const { result, model } = createContextHarness(() => useFlowReviewStatus())
		model.controller.on('accept', () => undefined)
		result.setHooksOpen(true)
		expect(result.isHooksOpen.value).toBe(true)
		expect(result.hooksLabel.value).toBe(formatMessage(UI_FLOW_REVIEW.HOOKS_COUNT, { count: result.bindings.value.length }))
		const accept = result.bindings.value.find(item => item.name === 'accept')
		expect(accept).toBeDefined()
		expect(result.bindingLabel(accept as never)).toBe(formatMessage(UI_FLOW_REVIEW.HOOK_ON, { name: 'accept' }))
		result.toggleBinding(accept as never, false)
		expect(result.bindingLabel(result.bindings.value.find(item => item.name === 'accept') as never)).toBe(
			formatMessage(UI_FLOW_REVIEW.HOOK_OFF, { name: 'accept' }),
		)
		result.setHooksOpen(false)
		expect(result.isHooksOpen.value).toBe(false)
	})
})

describe('useFlowReviewCompare', () => {
	it('сравнение с версией, которой нет в списке: подписи слоёв без номера версии', async () => {
		const { result } = createContextHarness(() => useFlowReviewCompare(), { compareWith: 'нет такой' })
		expect(result.isOpen.value).toBe(true)
		expect(result.options.value.map(item => item.label)).toEqual([
			formatMessage(UI_FLOW_REVIEW.COMPARE_OLD, { version: '' }),
			formatMessage(UI_FLOW_REVIEW.COMPARE_NEW, { version: '' }),
			UI_FLOW_REVIEW.COMPARE_DIFF,
		])
		expect(result.summary.value).toBe('')
		result.side.value = 'old'
		await nextTick()
		expect(result.side.value).toBe('old')
		result.close()
		expect(result.isOpen.value).toBe(false)
	})
})

describe('useFlowReviewPins', () => {
	it('вне режима «Правки» булавок нет, даже если комментарии есть', () => {
		const comments = [
			{ id: 't1', target: { entity: 'node' as const, id: 'a' }, comments: [{ id: 'c1', author: BORIS, text: 'x', date: 1 }] },
		]
		const { result, props } = createContextHarness(() => useFlowReviewPins(), { comments })
		expect(result.pins.value).toHaveLength(1)
		props.mode = 'view'
		expect(result.pins.value).toEqual([])
	})

	it('isOpen и setOpen следуют за активной цепочкой', () => {
		const comments = [{ id: 't1', target: { entity: 'node' as const, id: 'a' }, comments: [] }]
		const { result } = createContextHarness(() => useFlowReviewPins(), { comments })
		const [pin] = result.pins.value
		expect(result.isOpen(pin.thread)).toBe(false)
		result.setOpen(pin.thread, true)
		expect(result.isOpen(pin.thread)).toBe(true)
		result.setOpen(pin.thread, false)
		expect(result.activeId.value).toBeNull()
	})
})

describe('useFlowVersionList', () => {
	it('без версий список пуст, кнопка называется по состоянию', () => {
		const { result } = createContextHarness(() => useFlowVersionList())
		expect(result.isEmpty.value).toBe(true)
		expect(result.buttonLabel(false)).toBe(UI_FLOW_REVIEW.COMPARE_WITH_CURRENT)
		expect(result.buttonLabel(true)).toBe(UI_FLOW_REVIEW.COMPARING)
	})
})
