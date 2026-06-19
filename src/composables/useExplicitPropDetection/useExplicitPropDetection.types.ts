/**
 * Возвращаемое значение composable useExplicitPropDetection.
 */
export interface UseExplicitPropDetectionReturn {
	/** Проверить, был ли явно передан проп (camelCase или kebab-case) */
	wasPropPassed: (propName: string) => boolean
	/** Разрешить boolean-проп с учётом явной передачи */
	resolveBooleanPropDefault: (propName: string, value: boolean | undefined, defaultValue: boolean) => boolean
}
