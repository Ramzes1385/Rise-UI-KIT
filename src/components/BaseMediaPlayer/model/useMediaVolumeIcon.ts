import { computed } from 'vue'
import type { MediaVolumeIconProps } from '../types/MediaVolumeIcon.types'

function arcOpacity(level: number, from: number): number {
	return Math.min(1, Math.max(0, (level - from) * 2))
}

export function useMediaVolumeIcon(props: MediaVolumeIconProps) {
	const level = computed(() => (props.isMuted ? 0 : props.volume))
	return {
		isSilent: computed(() => level.value === 0),
		nearArcStyle: computed(() => ({ opacity: arcOpacity(level.value, 0) })),
		farArcStyle: computed(() => ({ opacity: arcOpacity(level.value, 0.5) })),
	}
}
