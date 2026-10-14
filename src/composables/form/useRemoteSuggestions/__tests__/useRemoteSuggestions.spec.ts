import { effectScope } from 'vue'
import { useRemoteSuggestions } from '../useRemoteSuggestions'
import type { RemoteSuggestionsSource } from '../types/useRemoteSuggestions.types'

function setup(source: RemoteSuggestionsSource<string>) {
	const scope = effectScope()
	const state = scope.run(() => useRemoteSuggestions({ source: () => source, minChars: () => 2, debounce: () => 100 }))!
	return { scope, state }
}

describe('useRemoteSuggestions', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('ищет после паузы и снимает загрузку', async () => {
		const source = vi.fn(async (query: string) => [`${query}-1`])
		const { state } = setup(source)

		state.search('мо')
		expect(state.isLoading.value).toBe(true)
		expect(source).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(100)

		expect(source).toHaveBeenCalledWith('мо', { signal: expect.any(AbortSignal) })
		expect(state.suggestions.value).toEqual(['мо-1'])
		expect(state.isLoading.value).toBe(false)
	})

	it('короткий запрос очищает список без запроса', async () => {
		const source = vi.fn(async () => ['a'])
		const { state } = setup(source)
		state.search('мос')
		await vi.advanceTimersByTimeAsync(100)

		state.search(' м ')
		await vi.advanceTimersByTimeAsync(100)

		expect(source).toHaveBeenCalledTimes(1)
		expect(state.suggestions.value).toEqual([])
		expect(state.isLoading.value).toBe(false)
	})

	it('новый запрос отменяет прежний: устаревший ответ отброшен', async () => {
		const resolvers: ((value: string[]) => void)[] = []
		const signals: AbortSignal[] = []
		const source: RemoteSuggestionsSource<string> = (_query, { signal }) => {
			signals.push(signal)
			return new Promise(resolve => resolvers.push(resolve))
		}
		const { state } = setup(source)
		state.search('мос')
		await vi.advanceTimersByTimeAsync(100)
		state.search('моск')
		await vi.advanceTimersByTimeAsync(100)

		resolvers[0](['старое'])
		resolvers[1](['новое'])
		await Promise.resolve()
		await Promise.resolve()

		expect(signals[0].aborted).toBe(true)
		expect(state.suggestions.value).toEqual(['новое'])
	})

	it('ошибка источника очищает список', async () => {
		const { state } = setup(async () => {
			throw new Error('сеть')
		})
		state.search('мос')
		await vi.advanceTimersByTimeAsync(100)

		expect(state.suggestions.value).toEqual([])
		expect(state.isLoading.value).toBe(false)
		expect(state.hasError.value).toBe(true)
	})

	it('новый запрос сбрасывает признак ошибки', async () => {
		let attempt = 0
		const { state } = setup(async () => {
			if (attempt++ === 0) throw new Error('сеть')
			return ['ок']
		})
		state.search('мос')
		await vi.advanceTimersByTimeAsync(100)
		expect(state.hasError.value).toBe(true)

		state.search('моск')
		expect(state.hasError.value).toBe(false)
		await vi.advanceTimersByTimeAsync(100)
		expect(state.suggestions.value).toEqual(['ок'])
		expect(state.hasError.value).toBe(false)
	})

	it('reset отменяет идущий запрос и очищает список, загрузку и ошибку', async () => {
		const signals: AbortSignal[] = []
		const { state } = setup((_query, { signal }) => {
			signals.push(signal)
			return new Promise(() => undefined)
		})
		state.search('мос')
		await vi.advanceTimersByTimeAsync(100)
		expect(state.isLoading.value).toBe(true)

		state.reset()

		expect(signals[0].aborted).toBe(true)
		expect(state.isLoading.value).toBe(false)
		expect(state.suggestions.value).toEqual([])
		expect(state.hasError.value).toBe(false)
	})

	it('отменённый запрос с ошибкой не трогает состояние', async () => {
		const { state } = setup(
			(_query, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('abort')))),
		)
		state.search('мос')
		await vi.advanceTimersByTimeAsync(100)
		state.cancel()
		await Promise.resolve()

		expect(state.isLoading.value).toBe(true)
	})

	it('остановка области отменяет отложенный запрос', async () => {
		const source = vi.fn(async () => ['a'])
		const { scope, state } = setup(source)
		state.search('мос')
		scope.stop()
		await vi.advanceTimersByTimeAsync(100)

		expect(source).not.toHaveBeenCalled()
	})
})
