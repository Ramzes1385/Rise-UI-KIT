/** Composable: слушатели перетаскивания на document и временные стили body на время resize */
import type { SavedBodyStyles, UseResizeDragOptions } from './types/useResizeDrag.types'

function useResizeDrag({ onMove, onEnd }: UseResizeDragOptions) {
	/** Стили body до начала перетаскивания: после него возвращаем их, а не затираем пустой строкой */
	let savedBodyStyles: SavedBodyStyles | null = null

	/** Повесить слушатели перетаскивания и выставить курсор/запрет выделения на body */
	function attach(): void {
		document.addEventListener('mousemove', onMove)
		document.addEventListener('mouseup', onEnd)
		// Повторный старт без mouseup (потерян за пределами окна) не должен перезаписать исходные стили
		if (!savedBodyStyles) {
			savedBodyStyles = { cursor: document.body.style.cursor, userSelect: document.body.style.userSelect }
		}
		document.body.style.cursor = 'col-resize'
		document.body.style.userSelect = 'none'
	}

	/** Снять слушатели перетаскивания и вернуть стили body */
	function release(): void {
		document.removeEventListener('mousemove', onMove)
		document.removeEventListener('mouseup', onEnd)
		if (savedBodyStyles) {
			document.body.style.cursor = savedBodyStyles.cursor
			document.body.style.userSelect = savedBodyStyles.userSelect
			savedBodyStyles = null
		}
	}

	return { attach, release }
}

export { useResizeDrag }
