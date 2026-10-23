/** Утилиты: отменяемые хуки с приоритетом — общий механизм BaseFlowMap и BaseRoadmap */
import type { AnyHooks, HookEntry } from '../types/historyInternal.types'
import type { HookOutcome, HookRunner, HookSubscription, HookValue } from '../types/useCommandHistory.types'

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
	return typeof (value as PromiseLike<unknown> | null)?.then === 'function'
}

/** Контекст для следующего обработчика: поля, где лежал прежний объект, получают заменённое значение */
function withReplacement(context: unknown, previous: unknown, next: unknown): unknown {
	if (!isObject(context) || !isObject(previous) || previous === next) return context
	const entries = Object.entries(context).map(([key, item]) => [key, item === previous ? next : item] as const)
	return Object.fromEntries(entries)
}

function toPublic(item: HookEntry): HookSubscription {
	return {
		id: item.id,
		name: item.name,
		handler: item.handler.name,
		priority: item.priority,
		isEnabled: item.isEnabled,
		calls: item.calls,
	}
}

function sortByPriority(entries: readonly HookEntry[]): HookEntry[] {
	return entries
		.map((item, index) => ({ item, index }))
		.sort((left, right) => right.item.priority - left.item.priority || left.index - right.index)
		.map(({ item }) => item)
}

/** Прогон обработчиков по порядку: отмена, замена значения, ожидание Promise */
async function runEntries(entries: readonly HookEntry[], context: unknown, value: unknown): Promise<HookOutcome<unknown>> {
	let current = context
	let result = value
	for (const item of entries) {
		item.calls += 1
		let answer = item.handler(current)
		if (isThenable(answer)) answer = await answer
		if (answer === false) return { isCancelled: true, value: result }
		if (answer !== undefined && answer !== true) {
			current = withReplacement(current, result, answer)
			result = answer
		}
	}
	return { isCancelled: false, value: result }
}

/**
 * Хуки: обработчики идут по убыванию `priority` (при равенстве — в порядке подписки); первый `false` отменяет,
 * объект заменяет значение и подставляется в контекст следующих обработчиков; Promise ждётся.
 * Исключение обработчика не гасится — его ловит вызывающий.
 */
export function createHookRunner<H extends AnyHooks<H>>(): HookRunner<H> {
	const entries: HookEntry[] = []
	let counter = 0

	function named(name?: keyof H): HookEntry[] {
		return sortByPriority(entries.filter(item => name === undefined || item.name === name))
	}

	return {
		on(name, handler, options) {
			counter += 1
			const item: HookEntry = {
				id: `hook-${counter}`,
				name: name as string,
				handler: handler as unknown as HookEntry['handler'],
				priority: options?.priority ?? 0,
				isEnabled: true,
				calls: 0,
			}
			entries.push(item)
			return () => {
				const index = entries.indexOf(item)
				if (index >= 0) entries.splice(index, 1)
			}
		},
		run: (name, context, value) =>
			runEntries(
				named(name).filter(item => item.isEnabled),
				context,
				value,
			) as Promise<HookOutcome<HookValue<H[typeof name]>>>,
		has: name => entries.some(item => item.name === name && item.isEnabled),
		list: name => named(name).map(toPublic),
		setEnabled(id, isEnabled) {
			const item = entries.find(entry => entry.id === id)
			if (item) item.isEnabled = isEnabled
		},
	}
}
