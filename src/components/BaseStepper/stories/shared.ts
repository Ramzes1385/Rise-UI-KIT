import type { BaseStepperStep } from '../types/BaseStepper.types'

export const STEPS: BaseStepperStep[] = [
	{ label: 'Корзина', description: 'Проверьте товары' },
	{ label: 'Доставка', description: 'Адрес и время' },
	{ label: 'Оплата', description: 'Карта или счёт' },
	{ label: 'Подтверждение', description: 'Итог заказа' },
]

export const MODEL_KEYS = ['modelValue', 'onUpdate:modelValue']

export const SLOT_KEYS = ['item', 'header', 'footer']
