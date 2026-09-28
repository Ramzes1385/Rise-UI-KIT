import { nextTick, ref, watch } from 'vue'
import type { BaseTableToolbarProps } from '../types/BaseTableToolbar.types'

const HIDDEN_LABEL = { label: 'base-table__visually-hidden' }
const SETTINGS_OPTION = { labelWrapper: 'base-table__settings-option' }

export function useBaseTableToolbar(props: BaseTableToolbarProps) {
	const settingsListRef = ref<HTMLElement | null>(null)

	watch(
		() => props.isSettingsOpen,
		async isOpen => {
			if (!isOpen) return
			await nextTick()
			settingsListRef.value?.querySelector<HTMLInputElement>('input')?.focus()
		},
	)

	return { hiddenLabel: HIDDEN_LABEL, settingsOption: SETTINGS_OPTION, settingsListRef }
}
