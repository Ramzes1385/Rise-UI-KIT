/** Утилиты: выбор 3D-модели узла по порядку раздела 6.2 контракта (поле узла, resolver, вид нотации, слова, запасная) */

import { isModel3DPreset } from '../presets'
import { collectPresetWordGroups, pickByWords } from '../keywords'
import type { Model3DDefinition, Model3DDefinitions, Model3DSet } from '../../types/model3d.types'
import type { Model3DLookup, Model3DResolveOptions } from '../../types/internal/model3dRuntime.types'
import type { Model3DResolution, Model3DSelection, Model3DSource, Model3DWordGroup } from '../../types/internal/model3dInternal.types'

/** Определение по ключу: модели компонента → приложения → встроенная; нет — `null` */
export function findDefinition(key: string, lookup: Model3DLookup): Model3DDefinition | null {
	if (Object.hasOwn(lookup.component, key)) return lookup.component[key]
	if (Object.hasOwn(lookup.app, key)) return lookup.app[key]
	return isModel3DPreset(key) ? { preset: key } : null
}

/** Группы слов для подбора: свои модели компонента, модели приложения, затем встроенные нужных наборов */
export function collectWordGroups(lookup: Model3DLookup, sets: readonly Model3DSet[]): Model3DWordGroup[] {
	const own = (defs: Model3DDefinitions, rank: number): Model3DWordGroup[] =>
		Object.entries(defs).map(([id, definition]) => ({ id, words: definition.words ?? [], rank }))
	return [...own(lookup.component, 0), ...own(lookup.app, 1), ...collectPresetWordGroups(sets)]
}

function found(key: string, source: Model3DSource, lookup: Model3DLookup): Model3DResolution | null {
	const definition = findDefinition(key, lookup)
	return definition ? { key, definition, source } : null
}

function byKey(key: string | null | undefined, source: Model3DSource, options: Model3DResolveOptions): Model3DResolution | null {
	if (!key) return null
	const resolution = found(key, source, options.lookup)
	if (!resolution) options.warn(`3D-модель «${key}» не найдена, выбор продолжается по списку`)
	return resolution
}

function byKind(selection: Model3DSelection, options: Model3DResolveOptions): Model3DResolution | null {
	if (selection.kindModel === undefined) return { key: 'shape', definition: { preset: 'shape' }, source: 'shape' }
	return selection.kindModel === 'auto' ? null : byKey(selection.kindModel, 'kind', options)
}

function byWords(selection: Model3DSelection, options: Model3DResolveOptions): Model3DResolution | null {
	const { node } = selection
	const id = pickByWords([node.title, ...(node.tags ?? [])].join(' '), collectWordGroups(options.lookup, options.sets))
	return id ? found(id, 'words', options.lookup) : null
}

function byFallback(selection: Model3DSelection, options: Model3DResolveOptions): Model3DResolution {
	const kind = selection.isExternal ? 'cloud' : selection.kindFallback
	const fallback = isModel3DPreset(options.fallback) ? options.fallback : 'server'
	return (kind && found(kind, 'fallback', options.lookup)) || found(fallback, 'fallback', options.lookup)!
}

/** Модель узла: первая найденная по порядку 6.2; неизвестный ключ — `warn` и дальше. Всегда возвращает модель (запасная) */
export function resolveModel(selection: Model3DSelection, options: Model3DResolveOptions): Model3DResolution {
	const { model3d, node } = selection
	if (model3d?.url) return { key: model3d.url, definition: { url: model3d.url }, source: 'url' }
	return (
		byKey(model3d?.model, 'node', options) ??
		byKey(options.modelResolver?.(node), 'resolver', options) ??
		byKind(selection, options) ??
		byWords(selection, options) ??
		byFallback(selection, options)
	)
}
