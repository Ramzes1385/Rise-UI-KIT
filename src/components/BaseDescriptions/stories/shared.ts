import type { DescriptionsItem } from '../types/BaseDescriptions.types'

export const COMPANY: DescriptionsItem[] = [
	{ key: 'name', label: 'Компания', value: 'ООО «Ромашка»' },
	{ key: 'inn', label: 'ИНН', value: '7707083893', isCopyable: true },
	{ key: 'kpp', label: 'КПП', value: '770701001', isCopyable: true },
	{ key: 'ogrn', label: 'ОГРН', value: '1027700132195', isCopyable: true },
	{ key: 'director', label: 'Директор', value: 'Анна Соколова' },
	{ key: 'phone', label: 'Телефон', value: null },
	{ key: 'address', label: 'Юридический адрес', value: '125009, Москва, ул. Тверская, д. 1, офис 12', span: 'full' },
]

export const ORDER: DescriptionsItem[] = [
	{ key: 'number', label: 'Заказ', value: 'З-1052' },
	{ key: 'status', label: 'Статус', value: 'paid' },
	{ key: 'total', label: 'Сумма', value: '2 400,50 ₽' },
	{ key: 'email', label: 'Почта', value: 'pavel@example.com' },
]

export const SHORT: DescriptionsItem[] = COMPANY.slice(0, 3)
