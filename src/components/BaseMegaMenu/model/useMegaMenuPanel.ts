import { useId } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useMegaMenuCascade } from './cascade/useMegaMenuCascade'
import type { MegaMenuLink, MegaMenuPanelEmits, MegaMenuPanelProps, MegaMenuPromo } from '../types/BaseMegaMenu.types'

export function useMegaMenuPanel(props: MegaMenuPanelProps, emit: MegaMenuPanelEmits) {
	const baseId = useId()

	function handleSelect(link: MegaMenuLink, event: MouseEvent): void {
		if (!link.isDisabled) emit('select', link, event)
	}

	useMegaMenuCascade(props, handleSelect)
	return {
		groupTitleId: (index: number): string => `${baseId}-group-${index}`,
		promoLinkLabel: (promo: MegaMenuPromo): string => promo.linkLabel || UI_TEXT.MEGA_MENU_PROMO_LINK,
		hasPromoLink: (promo: MegaMenuPromo): boolean => Boolean(promo.to || promo.href),
		groupCount: (): number => Math.max(props.item.groups?.length ?? 0, 1),
		groupLinksId: (index: number): string => `${baseId}-group-${index}-link`,
		handleSelect,
		handlePromoSelect(promo: MegaMenuPromo, event: MouseEvent): void {
			emit('select', { label: promo.linkLabel || promo.title, to: promo.to, href: promo.href }, event)
		},
	}
}
