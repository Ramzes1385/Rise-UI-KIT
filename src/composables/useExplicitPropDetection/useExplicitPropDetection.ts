/** Composable: определение явно переданных пропсов и разрешение дефолтов булевых значений */
import { getCurrentInstance } from 'vue'
import type { UseExplicitPropDetectionReturn } from './useExplicitPropDetection.types'

function toKebabCase(value: string): string {
	return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

/** Detects whether a prop was explicitly passed by the parent (camelCase/kebab-case) and resolves boolean defaults. */
function useExplicitPropDetection(): UseExplicitPropDetectionReturn {
	const rawProps = getCurrentInstance()?.vnode.props ?? null

	function wasPropPassed(propName: string): boolean {
		if (rawProps === null) return false

		return (
			Object.prototype.hasOwnProperty.call(rawProps, propName) ||
			Object.prototype.hasOwnProperty.call(rawProps, toKebabCase(propName))
		)
	}

	function resolveBooleanPropDefault(propName: string, value: boolean | undefined, defaultValue: boolean): boolean {
		return wasPropPassed(propName) ? (value ?? defaultValue) : defaultValue
	}

	return { wasPropPassed, resolveBooleanPropDefault }
}

export { useExplicitPropDetection }
