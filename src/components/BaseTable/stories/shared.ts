import { within } from 'storybook/test'
import type { TableRow, TableColumn } from '../types/BaseTable.types'

export function formatRub(value: unknown): string {
	return `${new Intl.NumberFormat('ru-RU').format(Number(value))}\u00A0₽`
}

export function formatDate(value: unknown): string {
	const [year, month, day] = String(value).split('-')
	return `${day}.${month}.${year}`
}

export const ORDERS = [
	{
		id: 1,
		number: 'З-1041',
		customer: 'Анна Смирнова',
		city: 'Москва',
		status: 'Доставлен',
		date: '2025-05-14',
		total: 12490,
		progress: 100,
	},
	{ id: 2, number: 'З-1042', customer: 'Иван Петров', city: 'Казань', status: 'В пути', date: '2025-05-14', total: 3150, progress: 70 },
	{
		id: 3,
		number: 'З-1043',
		customer: 'Мария Кузнецова',
		city: 'Санкт-Петербург',
		status: 'Оплачен',
		date: '2025-05-13',
		total: 28700,
		progress: 30,
	},
	{
		id: 4,
		number: 'З-1044',
		customer: 'Олег Соколов',
		city: 'Новосибирск',
		status: 'Отменён',
		date: '2025-05-12',
		total: 990,
		progress: 0,
	},
	{
		id: 5,
		number: 'З-1045',
		customer: 'Екатерина Волкова',
		city: 'Екатеринбург',
		status: 'Доставлен',
		date: '2025-05-11',
		total: 7640,
		progress: 100,
	},
	{
		id: 6,
		number: 'З-1046',
		customer: 'Дмитрий Орлов',
		city: 'Москва',
		status: 'В пути',
		date: '2025-05-10',
		total: 15300,
		progress: 60,
	},
	{
		id: 7,
		number: 'З-1047',
		customer: 'Ольга Лебедева',
		city: 'Самара',
		status: 'Оплачен',
		date: '2025-05-09',
		total: 4380,
		progress: 20,
	},
	{
		id: 8,
		number: 'З-1048',
		customer: 'Сергей Новиков',
		city: 'Казань',
		status: 'Доставлен',
		date: '2025-05-08',
		total: 21900,
		progress: 100,
	},
	{
		id: 9,
		number: 'З-1049',
		customer: 'Наталья Морозова',
		city: 'Москва',
		status: 'Оплачен',
		date: '2025-05-07',
		total: 5870,
		progress: 40,
	},
	{
		id: 10,
		number: 'З-1050',
		customer: 'Алексей Фёдоров',
		city: 'Пермь',
		status: 'Доставлен',
		date: '2025-05-06',
		total: 9990,
		progress: 100,
	},
	{
		id: 11,
		number: 'З-1051',
		customer: 'Татьяна Козлова',
		city: 'Уфа',
		status: 'В пути',
		date: '2025-05-05',
		total: 13200,
		progress: 80,
	},
	{
		id: 12,
		number: 'З-1052',
		customer: 'Павел Никитин',
		city: 'Воронеж',
		status: 'Отменён',
		date: '2025-05-04',
		total: 2400,
		progress: 0,
	},
]

type Order = (typeof ORDERS)[number]

export function toRows(orders: readonly Order[], extra: Partial<TableRow> = {}): TableRow[] {
	return orders.map(order => ({ id: order.id, data: { ...order }, ...extra }))
}

export const ALL_ROWS = toRows(ORDERS)

export const COLUMNS: TableColumn[] = [
	{ key: 'number', label: 'Заказ' },
	{ key: 'customer', label: 'Покупатель', isSortable: true, sortType: 'string' },
	{ key: 'city', label: 'Город', isSortable: true, sortType: 'string' },
	{ key: 'status', label: 'Статус' },
	{ key: 'date', label: 'Дата', isSortable: true, sortType: 'date', formatter: formatDate },
	{ key: 'total', label: 'Сумма', isSortable: true, sortType: 'number', align: 'right', formatter: formatRub },
]

export const COMPACT_COLUMNS: TableColumn[] = [COLUMNS[0], COLUMNS[1], COLUMNS[3], COLUMNS[5]]

export function bodyRows(table: HTMLElement): HTMLElement[] {
	return within(table).getAllByRole('row').slice(1)
}
