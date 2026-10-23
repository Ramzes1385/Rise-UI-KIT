import { computed, ref, useId, watch } from 'vue'
import { getItemKey, hasPanel } from './megaMenuItems'
import { useExplicitPropDetection } from '@composables/base/useExplicitPropDetection'
import type { BaseMegaMenuEmits, MegaMenuItem, MegaMenuOpenSource, MegaMenuProps } from '../types/BaseMegaMenu.types'

export function useMegaMenuState(props: MegaMenuProps, emit: BaseMegaMenuEmits) {
	const { wasPropPassed } = useExplicitPropDetection()
	const isControlled = computed(() => wasPropPassed('openKey'))
	const internalKey = ref<string | undefined>()
	const source = ref<MegaMenuOpenSource>('click')
	const baseId = useId()
	const openKey = computed(() => (isControlled.value ? props.openKey : internalKey.value))
	watch([isControlled, () => props.openKey], ([controlled, value]) => {
		if (controlled) internalKey.value = value
	})
	const openItem = computed(() => props.items?.find(item => hasPanel(item) && getItemKey(item) === openKey.value))

	function setOpen(key: string | undefined, by: MegaMenuOpenSource): void {
		source.value = by
		if (key === openKey.value) return
		if (!isControlled.value) internalKey.value = key
		emit('update:openKey', key)
	}

	function indexOf(item: MegaMenuItem): number {
		return props.items?.indexOf(item) ?? -1
	}

	return {
		openKey,
		openItem,
		source,
		setOpen,
		close: (): void => setOpen(undefined, 'click'),
		isOpen: (item: MegaMenuItem): boolean => openItem.value === item,
		triggerId: (item: MegaMenuItem): string => `${baseId}-trigger-${indexOf(item)}`,
		panelId: (item: MegaMenuItem): string => `${baseId}-panel-${indexOf(item)}`,
		listId: `${baseId}-list`,
	}
}
