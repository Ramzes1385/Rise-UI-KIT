import { computed } from 'vue'
import { UI_PLAYER } from '@/locales/messages'
import { formatNumber } from '@/locales/state'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import type { MediaSettingsMenuEmits, MediaSettingsMenuProps } from '../types/MediaSettingsMenu.types'

function rateLabel(rate: number): string {
	return rate === 1 ? UI_PLAYER.SPEED_NORMAL : `${formatNumber(rate)}×`
}

function speedItem(props: MediaSettingsMenuProps, emit: MediaSettingsMenuEmits): DropdownMenuItem {
	return {
		label: `${UI_PLAYER.SPEED}: ${rateLabel(props.rate)}`,
		children: props.rates.map(rate => ({
			type: 'radio',
			label: rateLabel(rate),
			isChecked: rate === props.rate,
			onUpdateChecked: () => emit('select-rate', rate),
		})),
	}
}

function qualityItem(props: MediaSettingsMenuProps, emit: MediaSettingsMenuEmits): DropdownMenuItem {
	return {
		label: [UI_PLAYER.QUALITY, props.qualities.find(source => source.src === props.activeSrc)?.label].filter(Boolean).join(': '),
		children: props.qualities.map(source => ({
			type: 'radio',
			label: source.label,
			isChecked: source.src === props.activeSrc,
			onUpdateChecked: () => emit('select-quality', source),
		})),
	}
}

export function useMediaSettingsMenu(props: MediaSettingsMenuProps, emit: MediaSettingsMenuEmits) {
	return {
		label: computed(() => UI_PLAYER.SETTINGS),
		items: computed(() => (props.qualities.length > 1 ? [speedItem(props, emit), qualityItem(props, emit)] : [speedItem(props, emit)])),
	}
}
