/** Слой — открытое окно, панель, меню или тултип */
export interface LayerOptions {
	/** Открыт ли слой. Слой, открытый позже, — выше */
	isActive: () => boolean
	/** Элементы слоя: клик в них — клик «внутри» и для слоёв ниже (вложенные панели не закрывают родителя) */
	elements?: () => (Element | null | undefined)[]
	/** Escape: вызывается только у верхнего открытого слоя с обработчиком */
	onEscape?: () => void
	/** Нажатие мыши вне элементов слоя и слоёв выше него */
	onPointerDownOutside?: (event: MouseEvent) => void
	/** Слушать нажатие в фазе перехвата (capture): раньше обработчиков на элементах */
	isCapture?: boolean
}

export interface LayerEntry extends LayerOptions {
	/** Порядок открытия: у слоя, открытого позже, — больше */
	order: number
}
