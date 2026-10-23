import { formatMessage } from './state'

/** Предупреждение кита в консоли: строка словаря `UI_WARNINGS` на текущем языке с префиксом `[rise-ui-kit]` */
export function warn(message: string, params: Record<string, string | number> = {}): void {
	console.warn(`[rise-ui-kit] ${formatMessage(message, params)}`)
}
