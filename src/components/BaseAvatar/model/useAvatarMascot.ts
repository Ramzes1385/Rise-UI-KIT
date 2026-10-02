import { useReducedMotion } from '@composables/app/useReducedMotion'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { AvatarMascotProps, AvatarPupilOffset } from '../types/BaseAvatar.types'
import { AVATAR_MASCOT_PUPIL_RANGE, AVATAR_MASCOT_REACH } from '../types/BaseAvatar.types'

const round = (value: number): number => Math.round(value * 100) / 100

function toPupilOffset(rect: DOMRect, point: { x: number; y: number }): AvatarPupilOffset {
	const dx = point.x - (rect.left + rect.width / 2)
	const dy = point.y - (rect.top + rect.height / 2)
	const distance = Math.hypot(dx, dy)
	if (distance === 0) return { x: 0, y: 0 }
	const length = (Math.min(distance, AVATAR_MASCOT_REACH) / AVATAR_MASCOT_REACH) * AVATAR_MASCOT_PUPIL_RANGE
	return { x: round((dx / distance) * length), y: round((dy / distance) * length) }
}

export function useAvatarMascot(props: AvatarMascotProps) {
	const mascotRef = ref<SVGSVGElement | null>(null)
	const pupil = ref<AvatarPupilOffset>({ x: 0, y: 0 })
	const isReducedMotion = useReducedMotion()
	let frame = 0
	let pointer = { x: 0, y: 0 }

	const update = (): void => {
		frame = 0
		if (mascotRef.value) pupil.value = toPupilOffset(mascotRef.value.getBoundingClientRect(), pointer)
	}

	const handlePointerMove = (event: PointerEvent): void => {
		pointer = { x: event.clientX, y: event.clientY }
		if (!frame) frame = requestAnimationFrame(update)
	}

	const stopTracking = (): void => {
		document.removeEventListener('pointermove', handlePointerMove)
		cancelAnimationFrame(frame)
		frame = 0
	}

	const syncTracking = (): void => {
		stopTracking()
		if (!isReducedMotion.value) {
			document.addEventListener('pointermove', handlePointerMove, { passive: true })
			return
		}
		pupil.value = { x: 0, y: 0 }
	}

	onMounted(syncTracking)
	watch(isReducedMotion, syncTracking)
	onBeforeUnmount(stopTracking)

	return {
		mascotRef,
		pupilTransform: computed(() => `translate(${pupil.value.x} ${pupil.value.y})`),
		ariaAttrs: computed(() => (props.label ? { role: 'img', 'aria-label': props.label } : { 'aria-hidden': 'true' as const })),
	}
}
