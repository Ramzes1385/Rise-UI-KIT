import type { AvatarMascotTick, AvatarPupilOffset } from '../types/BaseAvatar.types'

const subscribers = new Set<AvatarMascotTick>()
let pointer: AvatarPupilOffset | null = null
let frame = 0
let lastTime = 0

function loop(): void {
	const now = performance.now()
	const seconds = (now - lastTime) / 1000
	lastTime = now
	frame = 0
	let isMoving = false
	subscribers.forEach(tick => {
		if (tick(seconds, pointer)) isMoving = true
	})
	if (isMoving) frame = requestAnimationFrame(loop)
}

export function wakeMascots(): void {
	if (frame || !subscribers.size) return
	lastTime = performance.now()
	frame = requestAnimationFrame(loop)
}

function handlePointerMove(event: PointerEvent): void {
	pointer = { x: event.clientX, y: event.clientY }
	wakeMascots()
}

export function subscribeMascot(tick: AvatarMascotTick): () => void {
	if (!subscribers.size) document.addEventListener('pointermove', handlePointerMove, { passive: true })
	subscribers.add(tick)
	wakeMascots()
	return () => {
		subscribers.delete(tick)
		if (subscribers.size) return
		document.removeEventListener('pointermove', handlePointerMove)
		cancelAnimationFrame(frame)
		frame = 0
		pointer = null
	}
}
