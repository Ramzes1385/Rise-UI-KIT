/** Утилиты: подписи 3D-моделей для палитры «Заменить модель» и библиотеки — название, вид, подпись ячейки для скринридера */

import { isModel3DPreset } from './presets'
import { formatMessage } from '@/locales/state'
import { UI_MODELS_3D } from '@/locales/messages'
import type { Model3DDefinition } from '../types/model3d.types'

const texts = (): Record<string, string> => UI_MODELS_3D as unknown as Record<string, string>

/** Название модели: своё (`title`), из словаря текущего языка для встроенной, иначе ключ */
export function modelTitle(key: string, definition?: Model3DDefinition): string {
	if (definition?.title) return definition.title
	const id = definition && 'preset' in definition ? definition.preset : key
	return isModel3DPreset(id) ? (texts()[`MODEL_${id.toUpperCase()}`] ?? key) : key
}

/** Название вида (client, gateway, service, store, queue, actor, external); неизвестный вид — как есть */
export function modelKindTitle(kind: string): string {
	return texts()[`KIND_${kind.toUpperCase()}`] ?? kind
}

/** Подпись ячейки палитры для скринридера: «<название>, модель <ключ>» */
export function modelCellLabel(title: string, key: string): string {
	return formatMessage(UI_MODELS_3D.CELL, { title, key })
}
