/**
 * Типы для компонента ChatHeader
 */
export interface ChatHeaderProps {
	/** Заголовок чата */
	title: string
	/** Подзаголовок чата */
	subtitle?: string
	/** URL аватара */
	avatar?: string
	/** Масштаб размера */
	sizeScale?: number
	/** Активен ли режим поиска */
	isSearching?: boolean
	/** Текущий поисковый запрос */
	searchQuery?: string
	/** Флаг, показывающий, что собеседник печатает */
	isTyping?: boolean
	/** Имя того, кто печатает (для групповых чатов) */
	typingUsername?: string
}

export interface ChatHeaderEmits {
	(event: 'avatar-click'): void
	(event: 'toggle-search'): void
	(event: 'update:searchQuery', value: string): void
	(event: 'info-click'): void
}
