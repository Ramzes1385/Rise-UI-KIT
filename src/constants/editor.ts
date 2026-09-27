/**
 * Константы редактора.
 * Группированы в объект UI_EDITOR для удобного доступа.
 */

import { localized } from './localized'

/** Строки редактора на текущем языке и цвета по умолчанию */
export const UI_EDITOR = localized('editor', { DEFAULT_TEXT_COLOR: '#000000', DEFAULT_BG_COLOR: '#ffff00' } as const)
