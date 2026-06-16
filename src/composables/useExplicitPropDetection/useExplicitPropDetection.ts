import { getCurrentInstance } from 'vue'

function toKebabCase(value: string): string {
	return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

function useExplicitPropDetection() {
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
