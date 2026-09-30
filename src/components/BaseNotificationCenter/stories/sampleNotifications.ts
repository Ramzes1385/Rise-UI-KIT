import { STORY_TODAY, STORY_USERS, storyDate } from '@/stories/helpers'
import type { NotificationCenterItem } from '../types/BaseNotificationCenter.types'

const minutesAgo = (minutes: number): Date => new Date(STORY_TODAY.getTime() - minutes * 60_000)

export const SAMPLE_NOTIFICATIONS: NotificationCenterItem[] = [
	{
		id: 'n1',
		title: 'Анна Смирнова упомянула вас',
		text: '«Проверьте, пожалуйста, макет оплаты до обеда»',
		date: minutesAgo(5),
		avatar: STORY_USERS[0].avatar,
	},
	{ id: 'n2', title: 'Заказ З-1052 оплачен', text: '12 400 ₽, карта •• 4242', date: minutesAgo(48), icon: 'check-circle' },
	{
		id: 'n3',
		title: 'Иван Петров ответил в задаче',
		text: 'Исправил перенос строк в таблице',
		date: minutesAgo(180),
		avatar: STORY_USERS[1].avatar,
	},
	{ id: 'n4', title: 'Отчёт за апрель готов', date: storyDate(-1, 18, 5), icon: 'download', isRead: true },
	{ id: 'n5', title: 'Новый вход в аккаунт', text: 'Chrome, Москва', date: storyDate(-3, 9, 40), icon: 'alert-triangle', isRead: true },
]
