/**
 * Composable: доступ к SVG-спрайту иконок.
 *
 * Примечание: `createIconPlugin` вынесен в `@plugins/iconPlugin` (SRP — плагин
 * отдельной ответственности от composable) и реэкспортируется здесь для обратной
 * совместимости публичного API `@composables`.
 */
export { createIconPlugin } from '@plugins/iconPlugin'
export type { IconPluginOptions } from '@plugins/iconPlugin'
export { useIcon } from './useIcon'
export type { UseIconReturn } from './useIcon.types'
