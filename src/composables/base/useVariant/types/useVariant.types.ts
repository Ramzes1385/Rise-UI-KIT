/**
 * Опции composable useVariant
 */
export interface UseVariantOptions {
	/** БЭМ-блок компонента (например 'base-accordion') */
	block: string
	/** Геттер текущего варианта */
	getVariant: () => string | undefined
}
