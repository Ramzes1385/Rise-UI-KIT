import { computed } from 'vue'
import { useCastSdk } from './useCastSdk'
import { formatMediaTime } from '@utils/mediaUtils'
import { UI_PLAYER, formatMessage } from './messages'
import { useRemotePlayback } from './useRemotePlayback'
import type { MediaCastOptions } from '../types/MediaCast.types'

export function usePlayerCast(options: MediaCastOptions) {
	const sdk = useCastSdk(options)
	const remote = useRemotePlayback(options.media)
	const isCasting = computed(() => sdk.isCastConnected.value || remote.isRemoteConnected.value)

	return {
		...sdk,
		...remote,
		hasCast: computed(() => sdk.isCastAvailable.value || remote.isRemoteAvailable.value || isCasting.value),
		isCasting,
		castLabel: computed(() => (isCasting.value ? UI_PLAYER.CAST_STOP : UI_PLAYER.CAST)),
		castMessage: computed(() =>
			sdk.castDevice.value ? formatMessage(UI_PLAYER.CAST_ACTIVE, { device: sdk.castDevice.value }) : UI_PLAYER.CAST_ACTIVE_TV,
		),
		castTimeText: computed(
			() => `${formatMediaTime(sdk.castRemote.currentTime, sdk.castRemote.duration)} / ${formatMediaTime(sdk.castRemote.duration)}`,
		),
		toggleCast(): void {
			if (sdk.isCastConnected.value) return sdk.stopCast()
			if (remote.isRemoteConnected.value || !sdk.isCastAvailable.value) return remote.promptRemote()
			void sdk.startCast()
		},
	}
}
