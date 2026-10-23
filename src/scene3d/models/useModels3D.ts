/** Composable: модели приложения — `createScene3DModels` (плагин, provide) и `useScene3DModels` (inject в компонентах 3D) */

import { inject } from 'vue'
import type { InjectionKey } from 'vue'
import type { Scene3DModelsPlugin } from '../types/internal/model3dInternal.types'
import type { Model3DDefinition, Model3DDefinitions } from '../types/model3d.types'

/** Ключ provide/inject: у каждого приложения свои модели, общего состояния модуля нет (SSR) */
export const SCENE3D_MODELS_KEY: InjectionKey<Model3DDefinitions> = Symbol('rise-scene3d-models')

/** Помощник типов: определение модели без потери вывода (`preset`, GLB или фабрика) */
export function defineModel3D<T extends Model3DDefinition>(definition: T): T {
	return definition
}

/**
 * Плагин приложения: свои модели по ключам для всех 3D-компонентов
 * @example app.use(createScene3DModels({ terminal: defineModel3D({ words: ['pay'], create: (node, ctx) => ({ object }) }) }))
 */
export function createScene3DModels(models: Model3DDefinitions): Scene3DModelsPlugin {
	return { install: app => app.provide(SCENE3D_MODELS_KEY, models) }
}

/** Модели приложения из `createScene3DModels`; нет плагина — пустой набор */
export function useScene3DModels(): Model3DDefinitions {
	return inject(SCENE3D_MODELS_KEY, {})
}
