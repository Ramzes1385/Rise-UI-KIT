import { computed } from 'vue'
import { useCastSdk } from './useCastSdk'
import { UI_PLAYER, formatMessage } from '../messages'
import { useRemotePlayback } from './useRemotePlayback'
import { formatMediaTime } from '@utils/media/mediaUtils'
import type { MediaCastOptions } from '../../types/playback/MediaCast.types'

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
		async toggleCast(): Promise<boolean> {
			if (sdk.isCastConnected.value) {
				sdk.stopCast()
				return true
			}
			if (remote.isRemoteConnected.value || !sdk.isCastAvailable.value) return remote.promptRemote()
			return sdk.startCast()
		},
	}
}
