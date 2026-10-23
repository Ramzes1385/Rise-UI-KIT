/** Composable: определение явно переданных пропсов и разрешение дефолтов булевых значений */
import { getCurrentInstance, onBeforeUpdate, shallowRef } from 'vue'
import type { UseExplicitPropDetectionReturn } from './types/useExplicitPropDetection.types'

function toKebabCase(value: string): string {
	return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

/**
 * Detects whether a prop was explicitly passed by the parent (camelCase/kebab-case) and resolves boolean defaults.
 * Читает `vnode.props` при каждом вызове; внутри `computed` результат пересчитывается, когда родитель начал или
 * перестал передавать проп (или слушатель) после монтирования.
 */
function useExplicitPropDetection(): UseExplicitPropDetectionReturn {
	const instance = getCurrentInstance()
	const currentProps = shallowRef(instance?.vnode.props ?? null)
	if (instance) {
		onBeforeUpdate(() => {
			currentProps.value = instance.vnode.props ?? null
		})
	}

	function wasPropPassed(propName: string): boolean {
		const rawProps = currentProps.value
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
