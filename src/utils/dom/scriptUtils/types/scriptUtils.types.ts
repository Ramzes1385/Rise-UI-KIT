/**
 * Настройки загрузки скрипта. `callbackName` — имя глобальной функции, которую вызовет сам скрипт, когда будет готов
 * (параметр `callback=` в адресе Google Maps); без него готовность — событие `load`. `attributes` — атрибуты тега
 * (`nonce`, `crossorigin`)
 */
export interface LoadScriptOptions {
	callbackName?: string
	attributes?: Record<string, string>
}

/** Окно с глобальной функцией готовности скрипта */
export type CallbackWindow = Window & Record<string, unknown>
