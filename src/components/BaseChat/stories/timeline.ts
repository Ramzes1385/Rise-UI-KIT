import { ANNA, sentAt, sentOn } from './shared'
import type { ChatMessage } from '../types/BaseChat.types'

type Moment = Pick<ChatMessage, 'time' | 'date' | 'createdAt'>

function other(id: string, text: string, at: Moment): ChatMessage {
	return { id, sender: 'other', senderId: 'u1', senderName: ANNA.name, senderAvatar: ANNA.avatar, text, ...at }
}

function mine(id: string, text: string, at: Moment): ChatMessage {
	return { id, sender: 'me', text, status: 'read', ...at }
}

export const DATE_MESSAGES: ChatMessage[] = [
	other('d1', 'Прошлогодний релиз вышел — собираем отзывы.', sentOn(-365, 18, 40)),
	mine('d2', 'Отлично, подготовлю сводку.', sentOn(-365, 18, 45)),
	other('d3', 'Макеты для новой версии готовы.', sentOn(-3, 11, 5)),
	mine('d4', 'Посмотрю после обеда.', sentOn(-3, 11, 20)),
	other('d5', 'Есть замечания по отступам в шапке.', sentOn(-1, 9, 30)),
	mine('d6', 'Исправил, проверьте ещё раз.', sentOn(-1, 17, 10)),
	other('d7', 'Теперь всё в порядке, спасибо!', sentOn(0, 9, 12)),
]

export const UNREAD_LAST_READ = 'n12'

export const UNREAD_MESSAGES: ChatMessage[] = [
	other('n1', 'Привет! Как продвигается задача с таблицей?', sentOn(-1, 10, 0)),
	mine('n2', 'Привет, почти закончил сортировку.', sentOn(-1, 10, 4)),
	other('n3', 'Отлично, а фильтры?', sentOn(-1, 10, 6)),
	mine('n4', 'Фильтры завтра.', sentOn(-1, 10, 9)),
	other('n5', 'Договорились.', sentOn(-1, 10, 11)),
	mine('n6', 'Кстати, обновил токены отступов.', sentOn(-1, 15, 30)),
	other('n7', 'Видела, спасибо.', sentOn(-1, 15, 34)),
	mine('n8', 'Релиз в пятницу, не забыли?', sentOn(0, 8, 50)),
	other('n9', 'Помню, всё по плану.', sentOn(0, 8, 55)),
	mine('n10', 'Тогда начинаю проверку тёмной темы.', sentOn(0, 9, 0)),
	other('n11', 'Хорошо, дай знать, если найдёшь расхождения.', sentOn(0, 9, 3)),
	mine('n12', 'Дам, до связи.', sentOn(0, 9, 5)),
	other('n13', 'Нашла ошибку в контрасте иконки на тёмном фоне.', sentOn(0, 10, 8)),
	other('n14', 'Скриншот пришлю следом.', sentOn(0, 10, 9)),
]

export const RECENT_MESSAGES: ChatMessage[] = [
	other('r1', 'Утром созвон по релизу, подключайтесь.', sentOn(0, 8, 30)),
	mine('r2', 'Буду.', sentOn(0, 8, 32)),
	other('r3', 'Подготовь, пожалуйста, список изменений.', sentOn(0, 8, 35)),
	mine('r4', 'Уже собираю.', sentOn(0, 8, 40)),
	other('r5', 'Напомню про тёмную тему графиков.', sentOn(0, 8, 45)),
	mine('r6', 'Графики на мне, закончу до обеда.', sentOn(0, 8, 50)),
	other('r7', 'А таблицы кто смотрит?', sentOn(0, 9, 0)),
	mine('r8', 'Иван посмотрит, я его попросил.', sentOn(0, 9, 5)),
	other('r9', 'Тогда всё готово к проверке.', sentOn(0, 9, 10)),
	mine('r10', 'Принято, начинаю.', sentOn(0, 9, 15)),
	other('r11', 'Если что-то найдёшь, пиши сразу.', sentOn(0, 9, 20)),
	mine('r12', 'Обязательно напишу.', sentOn(0, 9, 22)),
	other('r13', 'Скриншоты складывай в общую папку.', sentOn(0, 9, 25)),
	mine('r14', 'Хорошо, так и сделаю.', sentOn(0, 9, 27)),
]

export const OLDER_MESSAGES: ChatMessage[] = [
	other('o1', 'Вчера обсудили план на неделю.', sentOn(-1, 16, 0)),
	mine('o2', 'Да, основная часть — релиз 1.4.', sentOn(-1, 16, 5)),
	other('o3', 'Нужно закрыть задачи по доступности.', sentOn(-1, 16, 10)),
	mine('o4', 'Отмечу их в трекере.', sentOn(-1, 16, 12)),
	other('o5', 'И не забудь про локализацию.', sentOn(-1, 16, 20)),
	mine('o6', 'Не забуду.', sentOn(-1, 16, 22)),
]

export const EDIT_MESSAGES: ChatMessage[] = [
	other('e1', 'Когда будет готов отчёт по метрикам?', sentAt(9, 10)),
	mine('e2', 'Отчёт пришлю до конца дня', sentAt(9, 12)),
	other('e3', 'Хорошо, жду.', sentAt(9, 14)),
	mine('e4', 'Таблица в общей папке', sentAt(9, 40)),
	other('e5', 'Спасибо, посмотрю.', sentAt(9, 42)),
]
