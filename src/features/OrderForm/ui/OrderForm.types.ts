import type { Painting } from '@/entities/Painting'

/**
 * Данные формы заказа
 */
export interface OrderFormData {
	/** Имя клиента */
	name: string
	/** Телефон */
	phone: string
	/** Комментарий */
	comment: string
	/** ID картины */
	paintingId: number
}

/**
 * Пропсы компонента OrderForm
 */
export interface OrderFormProps {
	/** Выбранная картина */
	painting: Painting | null
}

/**
 * События компонента OrderForm
 */
export interface OrderFormEmits {
	(event: 'submit', data: OrderFormData): void
	(event: 'cancel'): void
}
