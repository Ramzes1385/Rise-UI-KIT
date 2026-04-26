/**
 * Пропсы компонента PaintingCard
 */
import type { Painting } from '../model/Painting.types'

export interface PaintingCardProps {
	/** Данные картины */
	painting: Painting
}

/**
 * События компонента PaintingCard
 */
export interface PaintingCardEmits {
	(event: 'order', painting: Painting): void
}
