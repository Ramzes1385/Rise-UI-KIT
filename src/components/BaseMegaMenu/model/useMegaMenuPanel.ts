import { useId } from 'vue'
import { getItemKey } from './megaMenuItems'
import { UI_TEXT } from '@/locales/messages'
import type { MegaMenuLink, MegaMenuPanelEmits, MegaMenuPanelProps, MegaMenuPromo } from '../types/BaseMegaMenu.types'

export function useMegaMenuPanel(props: MegaMenuPanelProps, emit: MegaMenuPanelEmits) {
	const baseId = useId()
	return {
		getItemKey,
		groupTitleId: (index: number): string => `${baseId}-group-${index}`,
		promoLinkLabel: (promo: MegaMenuPromo): string => promo.linkLabel || UI_TEXT.MEGA_MENU_PROMO_LINK,
		hasPromoLink: (promo: MegaMenuPromo): boolean => Boolean(promo.to || promo.href),
		groupCount: (): number => Math.max(props.item.groups?.length ?? 0, 1),
		handleSelect(link: MegaMenuLink, event: MouseEvent): void {
			if (!link.isDisabled) emit('select', link, event)
		},
		handlePromoSelect(promo: MegaMenuPromo, event: MouseEvent): void {
			emit('select', { label: promo.linkLabel || promo.title, to: promo.to, href: promo.href }, event)
		},
	}
}
