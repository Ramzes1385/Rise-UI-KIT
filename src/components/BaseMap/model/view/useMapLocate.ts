import { ref } from 'vue'
import { UI_MAP } from '@/locales/messages'
import type { BaseMapEmits, MapCoordinates, MapLocateError } from '../../types/BaseMap.types'

const GEOLOCATION_DENIED = 1
const GEOLOCATION_TIMEOUT = 3

const LOCATE_TEXTS = {
	denied: 'LOCATE_DENIED',
	unavailable: 'LOCATE_UNAVAILABLE',
	timeout: 'LOCATE_UNAVAILABLE',
	unsupported: 'LOCATE_UNSUPPORTED',
} as const

function locateReason(code: number): MapLocateError {
	if (code === GEOLOCATION_DENIED) return 'denied'
	return code === GEOLOCATION_TIMEOUT ? 'timeout' : 'unavailable'
}

export function useMapLocate(emit: BaseMapEmits, found: (point: MapCoordinates) => void, notify: (text: string) => void) {
	const isLocating = ref(false)

	function fail(reason: MapLocateError): void {
		isLocating.value = false
		notify(UI_MAP[LOCATE_TEXTS[reason]])
		emit('locate-error', reason)
	}

	function locate(): void {
		if (!navigator.geolocation) return fail('unsupported')
		isLocating.value = true
		navigator.geolocation.getCurrentPosition(
			({ coords }) => {
				isLocating.value = false
				found({ lat: coords.latitude, lng: coords.longitude })
			},
			error => fail(locateReason(error.code)),
		)
	}

	return { isLocating, locate }
}
