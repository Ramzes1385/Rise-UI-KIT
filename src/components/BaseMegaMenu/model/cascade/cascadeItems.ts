import type { InjectionKey } from 'vue'
import type { MegaMenuCascadeContext, MegaMenuSubPlacement } from '../../types/BaseMegaMenu.types'

export const MEGA_MENU_CASCADE_KEY: InjectionKey<MegaMenuCascadeContext> = Symbol('MegaMenuCascade')

export const LEVEL_LINK_SELECTOR = ':scope > li > .base-mega-menu__link'

const EDGE_GAP = 8

export function resolvePlacement(rect: Pick<DOMRect, 'right'>, viewportWidth: number): MegaMenuSubPlacement {
	return rect.right > viewportWidth - EDGE_GAP ? 'below' : 'side'
}
