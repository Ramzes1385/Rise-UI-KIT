/** Пункт меню плеера */
export interface MediaMenuItem {
	/** Ключ пункта в своём списке */
	id: string
	/** Подпись */
	label: string
	/** Текущее значение вложенного списка справа от подписи: «100 %», «Белый» */
	hint?: string
	/** Выбранное значение списка: галочка слева */
	isChecked?: boolean
	/** Вложенный список: открывается на месте текущего, сверху — «Назад» с его заголовком */
	children?: MediaMenuList
	/** Выбор пункта */
	onSelect?: () => void
}

/** Список меню плеера: заголовок и пункты */
export interface MediaMenuList {
	/** Заголовок списка; у вложенного — подпись кнопки «Назад» */
	title: string
	items: MediaMenuItem[]
	/** Выбор возвращает к предыдущему списку, а не закрывает меню: настройки вида субтитров */
	isKeptOpen?: boolean
}

export interface MediaMenuPanelProps {
	/** Корневой список */
	menu: MediaMenuList
}

export interface MediaMenuPanelEmits {
	/** Выбран пункт корневого списка: меню закрывается */
	(event: 'close'): void
}

export interface MediaPopoverProps {
	/** Сторона панели над кнопкой: по левому или правому краю кнопки */
	position?: 'top-start' | 'top-end'
}

export interface MediaPopoverSlots {
	/** Кнопка: открыта ли панель и переключатель */
	default: (props: { isOpen: boolean; toggle: () => void }) => unknown
	/** Содержимое панели и команда закрыть её */
	panel: (props: { close: () => void }) => unknown
}
