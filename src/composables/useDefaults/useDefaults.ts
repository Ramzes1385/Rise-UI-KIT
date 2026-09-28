/** Composable: значения props по умолчанию для всего приложения */
import { hasInjectionContext, inject } from 'vue'
import type { InjectionKey } from 'vue'
import type { UiKitDefaults } from './useDefaults.types'

/**
 * Ключ provide/inject значений по умолчанию (`createUiKitPlugin({ defaults })`). Symbol.for — как у пути
 * к спрайту: подпути пакета могут оказаться разными копиями модуля, а ключ должен совпадать
 */
export const DEFAULTS_KEY: InjectionKey<UiKitDefaults> = Symbol.for('rise-ui-kit.defaults')

/** Значения по умолчанию из плагина или null */
export function useDefaults(): UiKitDefaults | null {
	return hasInjectionContext() ? inject(DEFAULTS_KEY, null) : null
}

function resolveDefault(component: string, key: string, fallback: unknown): unknown {
	const defaults = useDefaults()
	const own = defaults?.[component]
	if (own && key in own) return own[key]
	const global = defaults?.global
	if (global && key in global) return global[key]
	return fallback
}

/**
 * Оборачивает значения по умолчанию компонента для `withDefaults`: каждое значение сначала ищется
 * в настройках плагина (`defaults[component]`, затем `defaults.global`). Vue вычисляет значение по умолчанию
 * в контексте экземпляра, поэтому inject работает, и у каждого приложения свои настройки.
 * Функции (фабрики объектов и массивов, значения props-функций) остаются как есть — их не переопределить.
 *
 * @example
 * const props = withDefaults(defineProps<BaseButtonProps>(), kitDefaults('BaseButton', { variant: DEFAULT_VARIANT }))
 */
export function kitDefaults<T extends object>(component: string, defaults: T): T {
	const result: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(defaults)) {
		result[key] = typeof value === 'function' ? value : () => resolveDefault(component, key, value)
	}
	return result as T
}
