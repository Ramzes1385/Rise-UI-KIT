/**
 * Composable: доступ к SVG-спрайту иконок.
 *
 * Примечание: `createIconPlugin` вынесен в `@icons/iconPlugin` (SRP — плагин
 * отдельной ответственности от composable) и реэкспортируется здесь для обратной
 * совместимости публичного API `@composables`.
 */
export { createIconPlugin } from '@icons/iconPlugin'
export type { IconPluginOptions } from '@icons/iconPlugin'
export { ICON_MAP_KEY, ICON_SPRITE_PATH_KEY, useIcon } from './useIcon'
export type { IconMap, ResolvedIcon, UseIconReturn } from './types/useIcon.types'
