import type { UiProp } from '@composables/base/useUi'
import type { VoiceRecording } from '@components/BaseVoiceRecorder'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export type ChatMessageSender = 'me' | 'other'
/**
 * Статус своего сообщения. `failed` — отправка не удалась: под сообщением появляются «Не отправлено», «Повторить» и «Удалить»
 * (события `retry-message` и `discard-message`)
 */
export type ChatMessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
/** Почему файл не прикреплён: тип не подходит под `accept`, размер больше `maxFileSize`, превышено `maxFiles` */
export type ChatAttachmentRejectReason = 'type' | 'size' | 'count'

/** Файл, который поле ввода не приняло: приходит в `detail` события `error` с типом `attachment` */
export interface ChatAttachmentRejection {
	/** Имя файла */
	name: string
	/** Причина отказа */
	reason: ChatAttachmentRejectReason
	/** Текст, который увидел пользователь (на языке кита) */
	message: string
}
export type ChatInfoTab = 'info' | 'media' | 'files' | 'links' | 'profile'

export interface ChatMessageAttachment {
	/** Уникальный идентификатор вложения */
	id: string
	/** Имя файла */
	name: string
	/** Тип вложения: изображение, файл или аудио (голосовое сообщение — плеер с волной) */
	type: 'image' | 'file' | 'audio'
	/** URL для отображения или скачивания */
	url: string
	/** Размер файла в читаемом формате (например, "1.2 MB") */
	size?: string
	/** Длительность аудио, секунды: видна до загрузки файла */
	duration?: number
	/** Амплитуды волны аудио от 0 до 1 (например, `peaks` записи BaseVoiceRecorder) */
	peaks?: number[]
}

export interface ChatMessageReaction {
	/** Эмодзи реакции */
	emoji: string
	/** Список имен пользователей, поставивших эту реакцию */
	users: string[]
}

export interface ChatMessage {
	/** Уникальный идентификатор сообщения */
	id: string
	/** Текст сообщения */
	text: string
	/** Отправитель: 'me' (я) или 'other' (собеседник) */
	sender: ChatMessageSender
	/** ID отправителя */
	senderId?: string
	/** Время отправки (например, "10:15") */
	time: string
	/**
	 * Момент отправки: ISO-строка, миллисекунды или `Date`. По нему между сообщениями разных дней появляются разделители
	 * («Сегодня», «Вчера», дата по языку кита). Без `createdAt` разделитель не выводится
	 */
	createdAt?: string | number | Date
	/** Дата отправки (например, "12 мая 2024") — для группировки медиа/файлов/ссылок */
	date?: string
	/** Имя отправителя */
	senderName?: string
	/** Аватар отправителя */
	senderAvatar?: string
	/** Статус доставки сообщения */
	status?: ChatMessageStatus
	/** Сообщение изменено: рядом со временем появляется пометка «изменено». Выставляет приложение после события `edit` */
	isEdited?: boolean
	/** Вложения к сообщению */
	attachments?: ChatMessageAttachment[]
	/** ID сообщения, на которое сделан ответ */
	replyToId?: string
	/** Текст сообщения, на которое сделан ответ */
	replyToText?: string
	/** Имя отправителя сообщения, на которое сделан ответ */
	replyToSenderName?: string
	/** Реакции на сообщение */
	reactions?: ChatMessageReaction[]
	/**
	 * Закреплено ли сообщение. Панель под шапкой показывает последнее закреплённое; клик по ней плавно прокручивает ленту
	 * к сообщению и переключает панель на предыдущее закреплённое — повторные клики обходят закрепы по кругу
	 */
	isPinned?: boolean
}

/** Значок участника: «подтверждён», достижение, роль в сообществе */
export interface ChatBadge {
	/** Уникальный идентификатор значка */
	id: string
	/** Название: подсказка при наведении, текст для скринридеров и подпись в профиле */
	label: string
	/** Иконка кита (например, `check-circle` — «подтверждён»); без `icon` и `emoji` выводится `star` */
	icon?: string
	/** Эмодзи вместо иконки — для достижений (например, «🏆») */
	emoji?: string
	/** Цвет иконки: CSS-значение или переменная (например, `var(--rise-info)`) */
	color?: string
}

export interface ChatMember {
	id: string
	name: string
	avatar?: string
	status?: 'online' | 'offline'
	role?: string
	warningsCount?: number
	/** Сколько предупреждений ведёт к блокировке именно для этого участника; без него — проп `maxWarnings` чата */
	maxWarnings?: number
	isBanned?: boolean
	/**
	 * Значки участника. В групповом чате видны рядом с именем в сообщениях (по `senderId`) и в списке участников:
	 * первые `maxBadges`, остальные — счётчиком «+N»; полный список с подписями — в профиле
	 */
	badges?: ChatBadge[]
}

export interface ChatCommand {
	/** Имя команды без слеша (например, "help") */
	name: string
	/** Описание команды для подсказки */
	description: string
}

/**
 * Варианты оформления сообщений: bubble — мягкие пузыри, flat — без пузырей с разделителями,
 * modern — карточки с рамкой.
 */
export const CHAT_VARIANTS = ['bubble', 'flat', 'modern'] as const

/**
 * Части чата для пропа `ui` (БЭМ-элементы `.base-chat__<часть>`, `root` — сам чат):
 * body — колонка внутри карточки; header — шапка; pinned — панель закреплённых; list — лента сообщений;
 * message — строка сообщения (и индикатора «печатает»); bubble — пузырь сообщения; input — поле ввода;
 * toolbar — панель выделенных сообщений.
 */
export const CHAT_PARTS = ['body', 'header', 'pinned', 'list', 'message', 'bubble', 'input', 'toolbar'] as const

export type BaseChatPart = (typeof CHAT_PARTS)[number]

export interface BaseChatProps extends BaseComponentProps<(typeof CHAT_VARIANTS)[number], 'root'> {
	messages: ChatMessage[]
	title: string
	subtitle?: string
	avatar?: string
	height?: string
	isTyping?: boolean
	typingUsername?: string
	isGroup?: boolean
	members?: ChatMember[]
	quickReplies?: string[]
	commands?: ChatCommand[]
	/**
	 * Закреплённые сообщения для панели под шапкой. Без пропа панель строится из `messages[].isPinned`; с ним — ровно из
	 * переданного списка (например, когда закрепы приходят отдельно от загруженной части истории)
	 */
	pinnedMessages?: ChatMessage[]
	/**
	 * Идентификатор чата. Когда он меняется у того же экземпляра (чат переключили в списке диалогов), сбрасываются ответ,
	 * редактирование, выделение, поиск, открытая панель «Информация» и черновик в поле ввода
	 */
	chatId?: string | number
	/**
	 * Какие файлы можно прикрепить: как атрибут `accept` у `<input type="file">` — расширения (`.pdf`), типы (`image/png`)
	 * и маски (`image/*`) через запятую. Файлы не из списка не прикрепляются: под полем ввода появляется сообщение, а в событии
	 * `error` с типом `attachment` — список отказов
	 */
	accept?: string
	/** Наибольший размер одного вложения, МБ (как `maxSize` у BaseFileUpload). Файл больше не прикрепляется (сообщение под полем и событие `error`). `0` или без значения — размер не ограничен */
	maxFileSize?: number
	/** Наибольшее число вложений в одном сообщении. Лишние файлы не прикрепляются (сообщение под полем и событие `error`) */
	maxFiles?: number
	/** Идентификатор текущего пользователя: админ не видит действия над собой в списке участников. По умолчанию — участник `me` */
	currentUserId?: string
	/** Статус собеседника в личном чате (в групповом берётся из `members[].status`). Без него — по тексту `subtitle` */
	companionStatus?: 'online' | 'offline'
	/**
	 * Последнее прочитанное сообщение. Перед первым непрочитанным чужим сообщением после него появляется разделитель
	 * «Непрочитанные» со счётчиком, а лента при открытии прокручивается к нему, а не к концу
	 */
	lastReadMessageId?: string
	/** Текущий день для «Сегодня» и «Вчера» в разделителях дат (по умолчанию — сегодня); в историях и тестах — фиксированный */
	today?: string | number | Date
	/** Первая загрузка ленты: вместо сообщений выводится скелетон */
	isLoading?: boolean
	/** Есть ли более старые сообщения: пока `true`, прокрутка к началу ленты вызывает событие `load-more` */
	hasMoreMessages?: boolean
	/** Идёт подгрузка более старых сообщений: события `load-more` не повторяются, вверху ленты — индикатор */
	isLoadingMore?: boolean
	/** Скачивать файл при клике по вложению. `false` — только событие `download-file` (файлы с авторизацией скачивает приложение) */
	autoDownload?: boolean
	currentUserRole?: 'admin' | 'member'
	/** Описание чата или собеседника для панели «Информация»; без него блок описания не выводится */
	description?: string
	/** Сколько предупреждений ведёт к блокировке: в профиле участника «2 из 3». Перекрывается `maxWarnings` участника */
	maxWarnings?: number
	/** Сколько значков участника видно рядом с именем; остальные — счётчиком «+N» с подсказкой */
	maxBadges?: number
	/** Голосовые сообщения: кнопка микрофона вместо «Отправить», пока поле пустое; запись приходит событием `send-voice` */
	hasVoiceMessages?: boolean
	/** Источник звука для голосовых вместо микрофона — как `requestStream` у BaseVoiceRecorder */
	requestVoiceStream?: () => Promise<MediaStream>
	/**
	 * Классы частей чата (`root`, `body`, `header`, `pinned`, `list`, `message`, `bubble`, `input`, `toolbar`) —
	 * добавляются к классам кита. Глобально — `createUiKitPlugin({ defaults: { BaseChat: { ui } } })`,
	 * классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseChat :messages="messages" title="Поддержка" :ui="{ bubble: 'shadow-sm', list: 'px-4' }" />
	 */
	ui?: UiProp<BaseChatPart>
}

export interface BaseChatEmits {
	(event: 'send', payload: { text: string; attachments?: ChatMessageAttachment[]; replyToId?: string }): void
	/** Выбраны файлы, прошедшие проверку `accept`, `maxFileSize` и `maxFiles`: приложение загружает их и подставляет вложения в сообщение */
	(event: 'attach', files: FileList): void
	/** Записано голосовое сообщение: приложение загружает `recording.blob` и добавляет сообщение с вложением `type: 'audio'` */
	(event: 'send-voice', payload: { recording: VoiceRecording; replyToId?: string }): void
	/**
	 * `avatar-click` — клик по аватару или имени отправителя; `write-message` — «Написать сообщение» в профиле участника
	 * (приложение открывает личный чат). Пока нет слушателя `write-message`, но есть `avatar-click`, «Написать сообщение»
	 * приходит как `avatar-click` (переходный период, с предупреждением в консоли); при обоих слушателях — только `write-message`
	 */
	(event: 'avatar-click' | 'write-message', senderId: string): void
	/** Изменился запрос поиска по сообщениям (в том числе очищен при закрытии поиска) */
	(event: 'search', query: string): void
	(event: 'message-select', messageId: string): void
	(event: 'info-click'): void
	(event: 'message-reaction', payload: { messageId: string; emoji: string }): void
	(event: 'quick-reply', text: string): void
	(event: 'download-file', file: ChatMessageAttachment): void
	/** `delete-messages` — удаление подтверждено в диалоге; `forward-messages` — «Переслать» в панели выбора */
	(event: 'delete-messages' | 'forward-messages', messageIds: string[]): void
	/** `pin-message` — «Закрепить» в меню сообщения (админ); `unpin-message` — «Открепить» в меню или крестик панели закреплённых */
	(event: 'pin-message' | 'unpin-message', messageId: string): void
	/** Админ нажал «Добавить участника» в панели «Информация» группового чата: выбор участника — на стороне приложения */
	(event: 'add-member'): void
	/** Автор подтвердил изменённый текст своего сообщения: приложение обновляет сообщение и ставит `isEdited` */
	(event: 'edit', payload: { messageId: string; text: string }): void
	/** Лента прокручена к началу, пока `hasMoreMessages` и не `isLoadingMore`: приложение подгружает более старые сообщения */
	(event: 'load-more'): void
	/**
	 * `retry-message` — «Повторить» под сообщением со статусом `failed`; `discard-message` — «Удалить» там же (без подтверждения);
	 * `jump-to-message` — закреплённого сообщения нет в загруженной части истории: приложение подгружает его и прокручивает ленту
	 */
	(event: 'retry-message' | 'discard-message' | 'jump-to-message', messageId: string): void
	(event: 'kick-member', memberId: string): void
	(event: 'ban-member', payload: { memberId: string; reason?: string; warningsCount?: number }): void
	(event: 'update-member-role', payload: { memberId: string; role: string }): void
	(event: 'mention-click', mention: string): void
	(event: 'command-click', command: string): void
	(event: 'error', payload: { type: string; message: string; detail?: unknown }): void
}

/** Слотов нет: содержимое строится из props */
export type BaseChatSlots = Record<never, never>
