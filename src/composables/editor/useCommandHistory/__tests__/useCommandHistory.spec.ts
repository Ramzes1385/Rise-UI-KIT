import { useCommandHistory } from '../useCommandHistory'
import type { CommandHistoryDirection, CommandHistoryEntry } from '../types/useCommandHistory.types'

interface Applied {
	changes: readonly string[]
	direction: CommandHistoryDirection
}

function entry(label: string, mergeKey?: string): CommandHistoryEntry<string> {
	return { label, redo: [`+${label}`], undo: [`-${label}`], mergeKey }
}

function setup(options: { limit?: number; mergeWindow?: number } = {}) {
	const applied: Applied[] = []
	const history = useCommandHistory<string>({
		...options,
		apply: (changes, direction) => applied.push({ changes, direction }),
	})
	return { history, applied }
}

describe('useCommandHistory', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-10-18T12:00:00Z'))
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	describe('состояние', () => {
		it('в начале нечего отменять и повторять', () => {
			const { history, applied } = setup()
			expect(history.state.value).toEqual({ canUndo: false, canRedo: false, undoLabel: undefined, redoLabel: undefined })
			expect(history.undo()).toBe(false)
			expect(history.redo()).toBe(false)
			expect(applied).toEqual([])
			expect(history.list()).toEqual([])
		})

		it('после push можно отменить, подпись берётся с верхнего шага', () => {
			const { history } = setup()
			history.push(entry('A'))
			history.push(entry('B'))
			expect(history.state.value).toMatchObject({ canUndo: true, canRedo: false, undoLabel: 'B' })
		})

		it('undo зовёт apply с шагами «назад», redo — «вперёд»', () => {
			const { history, applied } = setup()
			history.push(entry('A'))
			expect(history.undo()).toBe(true)
			expect(applied).toEqual([{ changes: ['-A'], direction: 'undo' }])
			expect(history.state.value).toMatchObject({ canUndo: false, canRedo: true, redoLabel: 'A' })
			expect(history.redo()).toBe(true)
			expect(applied[1]).toEqual({ changes: ['+A'], direction: 'redo' })
			expect(history.state.value).toMatchObject({ canUndo: true, canRedo: false })
		})

		it('новый шаг сбрасывает стек повтора', () => {
			const { history } = setup()
			history.push(entry('A'))
			history.undo()
			history.push(entry('B'))
			expect(history.state.value.canRedo).toBe(false)
			expect(history.redo()).toBe(false)
		})

		it('clear очищает оба стека', () => {
			const { history } = setup()
			history.push(entry('A'))
			history.push(entry('B'))
			history.undo()
			history.clear()
			expect(history.state.value.canUndo).toBe(false)
			expect(history.state.value.canRedo).toBe(false)
			expect(history.list()).toEqual([])
		})
	})

	describe('list', () => {
		it('отменяемые — от старых к новым, затем отменённые в порядке повтора', () => {
			const { history } = setup()
			history.push(entry('A'))
			vi.advanceTimersByTime(1000)
			history.push(entry('B'))
			vi.advanceTimersByTime(1000)
			history.push(entry('C'))
			history.undo()
			history.undo()
			const base = Date.parse('2026-10-18T12:00:00Z')
			expect(history.list()).toEqual([
				{ label: 'A', time: base, isUndone: false },
				{ label: 'B', time: base + 1000, isUndone: true },
				{ label: 'C', time: base + 2000, isUndone: true },
			])
		})
	})

	describe('глубина', () => {
		it('по умолчанию хранит 100 шагов, старые уходят первыми', () => {
			const { history } = setup()
			for (let index = 0; index < 105; index += 1) history.push(entry(`S${index}`))
			const labels = history.list().map(item => item.label)
			expect(labels).toHaveLength(100)
			expect(labels[0]).toBe('S5')
			expect(labels[99]).toBe('S104')
		})

		it('limit задаёт глубину', () => {
			const { history } = setup({ limit: 2 })
			history.push(entry('A'))
			history.push(entry('B'))
			history.push(entry('C'))
			expect(history.list().map(item => item.label)).toEqual(['B', 'C'])
			history.undo()
			history.undo()
			expect(history.undo()).toBe(false)
		})
	})

	describe('склейка mergeKey', () => {
		it('шаги с одним ключом в окне склеиваются: вперёд по порядку, назад сначала новые', () => {
			const { history, applied } = setup()
			history.push(entry('Набор 1', 'type'))
			vi.advanceTimersByTime(300)
			history.push(entry('Набор 2', 'type'))
			expect(history.list()).toHaveLength(1)
			expect(history.state.value.undoLabel).toBe('Набор 2')
			history.undo()
			expect(applied[0].changes).toEqual(['-Набор 2', '-Набор 1'])
			history.redo()
			expect(applied[1].changes).toEqual(['+Набор 1', '+Набор 2'])
		})

		it('окно считается от последней склейки, граница включительна', () => {
			const { history } = setup({ mergeWindow: 500 })
			history.push(entry('A', 'k'))
			vi.advanceTimersByTime(500)
			history.push(entry('B', 'k'))
			vi.advanceTimersByTime(500)
			history.push(entry('C', 'k'))
			expect(history.list()).toHaveLength(1)
		})

		it('за пределами окна шаги не склеиваются', () => {
			const { history } = setup({ mergeWindow: 500 })
			history.push(entry('A', 'k'))
			vi.advanceTimersByTime(501)
			history.push(entry('B', 'k'))
			expect(history.list()).toHaveLength(2)
		})

		it('разные ключи и шаги без ключа не склеиваются', () => {
			const { history } = setup()
			history.push(entry('A', 'one'))
			history.push(entry('B', 'two'))
			history.push(entry('C'))
			history.push(entry('D'))
			expect(history.list()).toHaveLength(4)
		})

		it('окно по умолчанию — 500 мс', () => {
			const { history } = setup()
			history.push(entry('A', 'k'))
			vi.advanceTimersByTime(499)
			history.push(entry('B', 'k'))
			expect(history.list()).toHaveLength(1)
		})
	})

	describe('transact', () => {
		it('собирает шаги в один с подписью транзакции: назад — в обратном порядке', () => {
			const { history, applied } = setup()
			const result = history.transact('Группа', () => {
				history.push(entry('A'))
				history.push(entry('B'))
				return 42
			})
			expect(result).toBe(42)
			expect(history.list().map(item => item.label)).toEqual(['Группа'])
			history.undo()
			expect(applied[0].changes).toEqual(['-B', '-A'])
			history.redo()
			expect(applied[1].changes).toEqual(['+A', '+B'])
		})

		it('пустая транзакция ничего не пишет', () => {
			const { history } = setup()
			history.transact('Пусто', () => undefined)
			expect(history.list()).toEqual([])
		})

		it('вложенные транзакции сливаются во внешнюю', () => {
			const { history } = setup()
			history.transact('Внешняя', () => {
				history.push(entry('A'))
				history.transact('Внутренняя', () => {
					history.push(entry('B'))
				})
				history.push(entry('C'))
			})
			expect(history.list().map(item => item.label)).toEqual(['Внешняя'])
			expect(history.state.value.undoLabel).toBe('Внешняя')
			history.undo()
			expect(history.state.value.canUndo).toBe(false)
		})

		it('исключение закрывает транзакцию и записывает уже сделанное, ошибка летит дальше', () => {
			const { history } = setup()
			expect(() =>
				history.transact('Сбой', () => {
					history.push(entry('A'))
					throw new Error('boom')
				}),
			).toThrow('boom')
			expect(history.list().map(item => item.label)).toEqual(['Сбой'])
			history.push(entry('B'))
			expect(history.list().map(item => item.label)).toEqual(['Сбой', 'B'])
		})

		it('асинхронная транзакция закрывается после Promise', async () => {
			const { history } = setup()
			const promise = history.transact('Асинхронно', async () => {
				history.push(entry('A'))
				await Promise.resolve()
				history.push(entry('B'))
				return 'ok'
			})
			expect(history.list()).toEqual([])
			await expect(promise).resolves.toBe('ok')
			expect(history.list().map(item => item.label)).toEqual(['Асинхронно'])
			history.undo()
			expect(history.state.value.canUndo).toBe(false)
		})

		it('отклонённый Promise закрывает транзакцию и пробрасывает ошибку', async () => {
			const { history } = setup()
			await expect(
				history.transact('Сбой', async () => {
					history.push(entry('A'))
					throw new Error('async boom')
				}),
			).rejects.toThrow('async boom')
			expect(history.list().map(item => item.label)).toEqual(['Сбой'])
		})

		it('результат null не считается Promise', () => {
			const { history } = setup()
			expect(history.transact('Null', () => null)).toBeNull()
		})
	})
})
