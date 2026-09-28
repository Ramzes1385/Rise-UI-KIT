/** Composable: доступ к SVG-спрайту иконок. createIconPlugin вынесен в @icons/iconPlugin (SRP), реэкспортируется здесь для обратной совместимости */
export { createIconPlugin } from '@icons/iconPlugin'
export type { IconPluginOptions } from '@icons/iconPlugin'
export { ICON_MAP_KEY, ICON_SPRITE_PATH_KEY, useIcon } from './useIcon'
export type { IconMap, ResolvedIcon, UseIconReturn } from './types/useIcon.types'
