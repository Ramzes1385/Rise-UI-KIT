/**
 * Интерфейс картины
 */
export interface Painting {
	/** Уникальный идентификатор */
	id: number
	/** Название картины */
	title: string
	/** Описание */
	description: string
	/** Цена в рублях */
	price: number
	/** URL изображения */
	imageUrl: string
	/** Материал (например, сталь, медь) */
	material: string
	/** Размеры (например, 60x40 см) */
	size: string
}
