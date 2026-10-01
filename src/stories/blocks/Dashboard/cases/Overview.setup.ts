import { ref } from 'vue'
import type { TimelineItem } from '@components/BaseTimeline'
import type { CommandItem } from '@components/BaseCommandPalette'
import type { TableColumn, TableRow } from '@components/BaseTable'

const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
const millions = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const formatRub = (value: unknown): string => rub.format(Number(value))
const formatMillions = (value: number): string => `${millions.format(value / 1_000_000)} млн ₽`

const weeks = ['8 июл', '15 июл', '22 июл', '29 июл', '5 авг', '12 авг', '19 авг', '26 авг', '2 сен', '9 сен', '16 сен', '23 сен']

const kpis = [
	{
		id: 'revenue',
		label: 'Выручка',
		value: '4,82 млн ₽',
		delta: '▲ 12% к августу',
		trend: [3.1, 3.4, 3.2, 3.8, 3.6, 4.0, 4.1, 3.9, 4.3, 4.5, 4.4, 4.82],
		format: (value: number) => `${millions.format(value)} млн ₽`,
	},
	{
		id: 'orders',
		label: 'Заказы',
		value: '1 284',
		delta: '▲ 8% к августу',
		trend: [880, 910, 940, 1010, 990, 1050, 1080, 1120, 1150, 1190, 1230, 1284],
		format: (value: number) => `${value} заказов`,
	},
	{
		id: 'check',
		label: 'Средний чек',
		value: '3 750 ₽',
		delta: '▲ 3% к августу',
		trend: [3520, 3560, 3490, 3610, 3580, 3640, 3600, 3660, 3700, 3680, 3720, 3750],
		format: (value: number) => formatRub(value),
	},
	{
		id: 'returns',
		label: 'Возвраты',
		value: '2,1%',
		delta: '▼ 0,4 п. п. к августу',
		trend: [3.2, 3.0, 2.9, 3.1, 2.8, 2.7, 2.6, 2.5, 2.5, 2.3, 2.2, 2.1],
		format: (value: number) => `${millions.format(value)}%`,
	},
]

const channels = [
	{ label: 'Сайт', value: 2_410_000 },
	{ label: 'Маркетплейсы', value: 1_370_000 },
	{ label: 'Приложение', value: 690_000 },
	{ label: 'Партнёры', value: 350_000 },
]

const activityEnd = '2026-09-30'
const activityWeeks = 20
const activity = Array.from({ length: activityWeeks * 7 }, (_, index) => {
	const date = new Date(Date.UTC(2026, 8, 30 - index))
	const weekday = date.getUTCDay()
	const isWeekend = weekday === 0 || weekday === 6
	return { date: date.toISOString().slice(0, 10), value: isWeekend ? index % 2 : (index * 7 + weekday * 3) % 12 }
})

const orderColumns: TableColumn[] = [
	{ key: 'number', label: 'Заказ', width: '96px' },
	{ key: 'customer', label: 'Покупатель' },
	{ key: 'status', label: 'Статус', width: '120px' },
	{ key: 'total', label: 'Сумма', align: 'right', width: '120px', formatter: formatRub },
]

const orderRows: TableRow[] = [
	{ id: 1052, data: { number: 'З-1052', customer: 'Павел Никитин', status: 'Оплачен', total: 2400 } },
	{ id: 1051, data: { number: 'З-1051', customer: 'Татьяна Козлова', status: 'В пути', total: 13_200 } },
	{ id: 1050, data: { number: 'З-1050', customer: 'Алексей Фёдоров', status: 'Доставлен', total: 9990 } },
	{ id: 1049, data: { number: 'З-1049', customer: 'Наталья Морозова', status: 'Оплачен', total: 5870 } },
	{ id: 1048, data: { number: 'З-1048', customer: 'Сергей Новиков', status: 'Доставлен', total: 21_900 } },
]

const events: TimelineItem[] = [
	{ id: 1, title: 'Заказ З-1052 оплачен', description: 'Павел Никитин · 2 400 ₽', date: '2026-09-30T09:12:00', color: 'success' },
	{ id: 2, title: 'Новый отзыв ★★★★★', description: '«Привезли на день раньше»', date: '2026-09-30T08:40:00', color: 'info' },
	{
		id: 3,
		title: 'Мало товара на складе',
		description: 'Кроссовки Run 42 — осталось 3 пары',
		date: '2026-09-29T18:05:00',
		color: 'warning',
	},
	{ id: 4, title: 'Отчёт за август готов', description: 'Выгрузка в Excel', date: '2026-09-29T10:00:00', color: 'neutral' },
]

const sections = [
	{ key: 'overview', label: 'Обзор', icon: 'home' },
	{ key: 'orders', label: 'Заказы', icon: 'inbox', badge: 12 },
	{ key: 'customers', label: 'Клиенты', icon: 'star' },
	{ key: 'reports', label: 'Отчёты', icon: 'file' },
	{ key: 'settings', label: 'Настройки', icon: 'settings' },
]

const commands: CommandItem[] = [
	...sections.map(section => ({ id: section.key, label: section.label, group: 'Разделы', icon: section.icon })),
	{ id: 'new-order', label: 'Новый заказ', group: 'Действия', icon: 'plus', shortcut: 'mod+shift+n', keywords: ['создать'] },
	{ id: 'export', label: 'Выгрузить отчёт', group: 'Действия', icon: 'download', keywords: ['excel', 'csv'] },
]

export function setup() {
	const active = ref('overview')
	const message = ref('')
	const isPaletteOpen = ref(false)

	function choose(command: CommandItem): void {
		const isSection = sections.some(section => section.key === command.id)
		if (isSection) active.value = command.id
		message.value = isSection ? `Открыт раздел «${command.label}»` : `Выполнено: ${command.label}`
	}

	return {
		kpis,
		weeks,
		channels,
		activity,
		activityEnd,
		activityWeeks,
		orderColumns,
		orderRows,
		events,
		sections,
		commands,
		formatMillions,
		active,
		message,
		isPaletteOpen,
		choose,
	}
}
