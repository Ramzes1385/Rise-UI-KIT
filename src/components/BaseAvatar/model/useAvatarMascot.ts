import { useMascotBlink } from './useMascotBlink'
import { subscribeMascot, wakeMascots } from './mascotTicker'
import { AVATAR_MASCOT_FACE_EYES } from '../types/BaseAvatar.types'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { EYE_CLOSED, MASCOT_FACES, MASCOT_MOODS, toBrowPath, toFaceVector, toLidOpacity, toMouthPath } from './mascotShapes'
import { EYE_SPRING, FACE_SPRING, PUPIL_SPRING, roundTo, settleSpring, TILT_SPRING, toPupilOffset, toTilt } from './mascotSpring'
import type {
	AvatarMascotMotion,
	AvatarMascotProps,
	AvatarMascotTargets,
	AvatarPupilOffset,
	AvatarSpringState,
} from '../types/BaseAvatar.types'

const still = (value: number): AvatarSpringState => ({ value, velocity: 0 })

const snapMotion = (targets: AvatarMascotTargets): AvatarMascotMotion => ({
	pupilX: still(targets.pupil.x),
	pupilY: still(targets.pupil.y),
	tilt: still(targets.tilt),
	eye: still(targets.eye),
	face: targets.face.map(still),
})

const isAtRest = (state: AvatarSpringState, target: number): boolean => state.velocity === 0 && state.value === target

function stepMotion(motion: AvatarMascotMotion, targets: AvatarMascotTargets, seconds: number): AvatarMascotMotion {
	const pupil = { seconds, config: PUPIL_SPRING }
	const face = { seconds, config: FACE_SPRING }
	return {
		pupilX: settleSpring(motion.pupilX, targets.pupil.x, pupil),
		pupilY: settleSpring(motion.pupilY, targets.pupil.y, pupil),
		tilt: settleSpring(motion.tilt, targets.tilt, { seconds, config: TILT_SPRING }),
		eye: settleSpring(motion.eye, targets.eye, { seconds, config: EYE_SPRING }),
		face: motion.face.map((state, index) => settleSpring(state, targets.face[index], face)),
	}
}

const isMotionAtRest = (motion: AvatarMascotMotion, targets: AvatarMascotTargets): boolean =>
	isAtRest(motion.pupilX, targets.pupil.x) &&
	isAtRest(motion.pupilY, targets.pupil.y) &&
	isAtRest(motion.tilt, targets.tilt) &&
	isAtRest(motion.eye, targets.eye) &&
	motion.face.every((state, index) => isAtRest(state, targets.face[index]))

function useAvatarMascotTargets(props: AvatarMascotProps, isStill: () => boolean, isBlinkClosed: () => boolean) {
	const shape = computed(() => MASCOT_MOODS[props.mood ?? 'idle'])
	return (rect: DOMRect | undefined, pointer: AvatarPupilOffset | null): AvatarMascotTargets => {
		const isTracking = !isStill() && rect && pointer
		const gaze = isStill() ? { x: 0, y: 0 } : shape.value.gaze
		return {
			pupil: gaze ?? (isTracking ? toPupilOffset(rect, pointer) : { x: 0, y: 0 }),
			tilt: isTracking ? toTilt(rect, pointer) : 0,
			eye: props.isEyesClosed || isBlinkClosed() ? EYE_CLOSED : shape.value.eyeOpen,
			face: toFaceVector(shape.value),
		}
	}
}

function useMascotView(props: AvatarMascotProps, motion: () => AvatarMascotMotion) {
	const face = computed(() => motion().face.map(state => roundTo(state.value)))
	const eye = computed(() => roundTo(motion().eye.value))
	const center = computed(() => MASCOT_FACES[props.mascot])
	return {
		faceTransform: computed(() => `translate(${center.value.x} ${center.value.y})`),
		tiltTransform: computed(() => `rotate(${roundTo(motion().tilt.value)} ${center.value.x} 52)`),
		pupilTransform: computed(() => `translate(${roundTo(motion().pupilX.value)} ${roundTo(motion().pupilY.value)})`),
		eyeTransform: computed(() => `scale(1 ${eye.value})`),
		lidOpacity: computed(() => roundTo(toLidOpacity(eye.value))),
		eyeOpacity: computed(() => roundTo(1 - toLidOpacity(eye.value))),
		mouthPath: computed(() => toMouthPath(face.value)),
		browLeftPath: computed(() => toBrowPath(face.value, 8)),
		browRightPath: computed(() => toBrowPath(face.value, 14)),
		browOpacity: computed(() => face.value[20]),
		eyes: AVATAR_MASCOT_FACE_EYES,
	}
}

export function useAvatarMascot(props: AvatarMascotProps) {
	const mascotRef = ref<SVGSVGElement | null>(null)
	const isReducedMotion = useReducedMotion()
	const isPresetNone = ref(false)
	const isStill = (): boolean => isReducedMotion.value || isPresetNone.value
	const isBlinkClosed = useMascotBlink(() => Boolean(props.isBlinking) && !isStill())
	const targetsFor = useAvatarMascotTargets(props, isStill, () => isBlinkClosed.value)
	const motion = shallowRef(snapMotion(targetsFor(undefined, null)))
	let unsubscribe: (() => void) | undefined

	const tick = (seconds: number, pointer: AvatarPupilOffset | null): boolean => {
		const targets = targetsFor(mascotRef.value?.getBoundingClientRect(), pointer)
		motion.value = isStill() ? snapMotion(targets) : stepMotion(motion.value, targets, seconds)
		return !isMotionAtRest(motion.value, targets)
	}

	onMounted(() => {
		isPresetNone.value = Boolean(mascotRef.value?.closest('[data-rise-motion="none"]'))
		unsubscribe = subscribeMascot(tick)
	})
	watch([() => props.mood, () => props.isEyesClosed, isBlinkClosed, isReducedMotion], wakeMascots)
	onBeforeUnmount(() => unsubscribe?.())

	return {
		mascotRef,
		...useMascotView(props, () => motion.value),
		ariaAttrs: computed(() => (props.label ? { role: 'img', 'aria-label': props.label } : { 'aria-hidden': 'true' as const })),
	}
}
