import type { CommentItem } from '../types/BaseCommentThread.types'
import { STORY_TODAY, STORY_USERS, storyDate } from '@/stories/helpers'

const [anna, ivan, maria, oleg] = STORY_USERS.map(user => ({ name: user.name, avatar: user.avatar }))

const minutesAgo = (minutes: number): Date => new Date(STORY_TODAY.getTime() - minutes * 60_000)

export const CURRENT_USER = { name: STORY_USERS[4].name, avatar: STORY_USERS[4].avatar }

export const SAMPLE_COMMENTS: CommentItem[] = [
	{
		id: 'c1',
		author: anna,
		text: 'Макет страницы оплаты готов. Посмотрите, пожалуйста, шаг с выбором карты — хочу убрать лишний экран.',
		date: storyDate(-1, 16, 20),
		likes: 3,
		isLiked: true,
		replies: [
			{
				id: 'c2',
				author: ivan,
				text: 'Согласен, экран лишний. Сохранённые карты можно показать прямо в форме.',
				date: minutesAgo(190),
				likes: 1,
				replies: [
					{
						id: 'c3',
						author: anna,
						text: 'Тогда нужна подпись «Новая карта» у последнего пункта.',
						date: minutesAgo(95),
						replies: [{ id: 'c4', author: maria, text: 'Добавила в ТЗ, пункт 4.2.', date: minutesAgo(40) }],
					},
				],
			},
		],
	},
	{
		id: 'c5',
		author: oleg,
		text: 'По данным за апрель на шаге выбора карты уходит 7% покупателей.\nЕсли уберём экран, проверим конверсию через две недели.',
		date: minutesAgo(12),
	},
]

const chain = (items: [typeof anna, string, number][]): CommentItem[] =>
	items.reduceRight<CommentItem[]>(
		(replies, [author, text, minutes], index) => [
			{ id: `d${index + 1}`, author, text, date: minutesAgo(minutes), ...(replies.length ? { replies } : {}) },
		],
		[],
	)

export const DEEP_COMMENTS: CommentItem[] = chain([
	[anna, 'Предлагаю перенести релиз на пятницу: тесты оплаты ещё не прошли.', 240],
	[ivan, 'В пятницу дежурит Олег, лучше четверг.', 210],
	[maria, 'В четверг демо для заказчика — не успеем проверить оплату.', 180],
	[oleg, 'Могу поменяться дежурством с Иваном, тогда пятница подходит.', 150],
	[anna, 'Тогда пятница, решено?', 120],
	[ivan, 'Решено. Обновлю план релиза и чек-лист.', 90],
	[maria, 'Предупрежу заказчика, что демо будет на сборке-кандидате.', 60],
	[oleg, 'Поставил напоминание в календарь команды на пятницу, 10:00.', 30],
])
