import type { InjectionKey } from 'vue'
import type { MegaMenuCascadeContext } from '../../types/BaseMegaMenu.types'

export const MEGA_MENU_CASCADE_KEY: InjectionKey<MegaMenuCascadeContext> = Symbol('MegaMenuCascade')

export const LEVEL_LINK_SELECTOR = ':scope > li > .base-mega-menu__link'

export function resolveFlip(rect: Pick<DOMRect, 'left' | 'right'>, preferLeft: boolean, viewportWidth: number): boolean {
	if (preferLeft) return rect.left >= 0
	return rect.right > viewportWidth
}
