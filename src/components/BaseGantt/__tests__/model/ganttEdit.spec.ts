import { normalizeTasks } from '../../model/tasks/ganttTasks'
import { applyDelta, durationDays, editedTask, isChanged, keyboardEdit, pointerEdit } from '../../model/edit/ganttEdit'

const at = (month: number, day: number): Date => new Date(2026, month - 1, day)
const key = (value: string, isShift: boolean, scale: 'day' | 'week' | 'month') => ({ key: value, isShift, scale })
const span = { start: at(10, 5), end: at(10, 9) }
const [bar, milestone, dated] = normalizeTasks([
	{ id: 'bar', name: 'Полоса', start: '2026-10-05', end: '2026-10-09' },
	{ id: 'milestone', name: 'Веха', start: '2026-10-05', isMilestone: true, end: '2026-10-07' },
	{ id: 'dated', name: 'Даты', start: at(10, 5), end: at(10, 9) },
])

describe('ganttEdit', () => {
	describe('applyDelta', () => {
		it('move сдвигает обе даты', () => {
			expect(applyDelta(span, { kind: 'move', days: 3, isMilestone: false })).toEqual({ start: at(10, 8), end: at(10, 12) })
			expect(applyDelta(span, { kind: 'move', days: -2, isMilestone: false })).toEqual({ start: at(10, 3), end: at(10, 7) })
		})

		it('resize-start двигает начало, но не дальше окончания', () => {
			expect(applyDelta(span, { kind: 'resize-start', days: -2, isMilestone: false })).toEqual({ start: at(10, 3), end: at(10, 9) })
			expect(applyDelta(span, { kind: 'resize-start', days: 10, isMilestone: false })).toEqual({ start: at(10, 9), end: at(10, 9) })
		})

		it('resize-end двигает окончание, но не раньше начала', () => {
			expect(applyDelta(span, { kind: 'resize-end', days: 2, isMilestone: false })).toEqual({ start: at(10, 5), end: at(10, 11) })
			expect(applyDelta(span, { kind: 'resize-end', days: -10, isMilestone: false })).toEqual({ start: at(10, 5), end: at(10, 5) })
		})

		it('веха только сдвигается, при любой правке', () => {
			const point = { start: at(10, 5), end: at(10, 5) }
			expect(applyDelta(point, { kind: 'move', days: 2, isMilestone: true })).toEqual({ start: at(10, 7), end: at(10, 7) })
			expect(applyDelta(point, { kind: 'resize-end', days: 2, isMilestone: true })).toEqual({ start: at(10, 7), end: at(10, 7) })
		})
	})

	describe('pointerEdit', () => {
		it('переводит сдвиг в пикселях в дни с округлением', () => {
			expect(pointerEdit(bar, { kind: 'move', deltaPx: 80, dayWidth: 36 })).toEqual({
				kind: 'move',
				span: { start: at(10, 7), end: at(10, 11) },
			})
			expect(pointerEdit(bar, { kind: 'resize-end', deltaPx: -20, dayWidth: 36 }).span.end).toEqual(at(10, 8))
			expect(pointerEdit(bar, { kind: 'move', deltaPx: 17, dayWidth: 36 }).span.start).toEqual(at(10, 5))
		})
	})

	describe('keyboardEdit', () => {
		it('стрелки сдвигают на шаг шкалы', () => {
			expect(keyboardEdit(bar, key('ArrowRight', false, 'day'))?.span).toEqual({ start: at(10, 6), end: at(10, 10) })
			expect(keyboardEdit(bar, key('ArrowLeft', false, 'week'))?.span).toEqual({ start: at(9, 28), end: at(10, 2) })
			expect(keyboardEdit(bar, key('ArrowRight', false, 'month'))?.span).toEqual({ start: at(11, 5), end: at(11, 9) })
		})

		it('Shift со стрелками меняет длительность через окончание, не короче дня', () => {
			expect(keyboardEdit(bar, key('ArrowRight', true, 'day'))).toEqual({
				kind: 'resize-end',
				span: { start: at(10, 5), end: at(10, 10) },
			})
			expect(keyboardEdit(bar, key('ArrowLeft', true, 'week'))?.span).toEqual({ start: at(10, 5), end: at(10, 5) })
		})

		it('веха всегда сдвигается, даже с Shift', () => {
			expect(keyboardEdit(milestone, key('ArrowRight', true, 'day'))).toEqual({
				kind: 'move',
				span: { start: at(10, 6), end: at(10, 6) },
			})
		})

		it('другие клавиши ничего не меняют', () => {
			expect(keyboardEdit(bar, key('ArrowUp', false, 'day'))).toBeNull()
			expect(keyboardEdit(bar, key('a', false, 'day'))).toBeNull()
		})
	})

	describe('isChanged и durationDays', () => {
		it('сравнивает даты по дням', () => {
			expect(isChanged(bar, { kind: 'move', span })).toBe(false)
			expect(isChanged(bar, { kind: 'move', span: { start: at(10, 6), end: at(10, 9) } })).toBe(true)
			expect(isChanged(bar, { kind: 'move', span: { start: at(10, 5), end: at(10, 10) } })).toBe(true)
		})

		it('длительность включает оба дня', () => {
			expect(durationDays(span)).toBe(5)
			expect(durationDays({ start: at(10, 5), end: at(10, 5) })).toBe(1)
		})
	})

	describe('editedTask', () => {
		it('строковые даты остаются строками, не меняя остальные поля', () => {
			expect(editedTask(bar, { kind: 'move', span: { start: at(10, 6), end: at(10, 10) } })).toEqual({
				id: 'bar',
				name: 'Полоса',
				start: '2026-10-06',
				end: '2026-10-10',
			})
		})

		it('Date остаются Date', () => {
			const task = editedTask(dated, { kind: 'move', span: { start: at(10, 6), end: at(10, 10) } })
			expect(task.start).toEqual(at(10, 6))
			expect(task.end).toEqual(at(10, 10))
		})

		it('у вехи меняется только начало, у задачи без окончания окончание появляется', () => {
			const moved = editedTask(milestone, { kind: 'move', span: { start: at(10, 6), end: at(10, 6) } })
			expect(moved.start).toBe('2026-10-06')
			expect(moved.end).toBe('2026-10-07')
			const [single] = normalizeTasks([{ id: 1, name: 'Один день', start: '2026-10-05' }])
			expect(editedTask(single, { kind: 'resize-end', span: { start: at(10, 5), end: at(10, 8) } }).end).toBe('2026-10-08')
		})
	})
})
