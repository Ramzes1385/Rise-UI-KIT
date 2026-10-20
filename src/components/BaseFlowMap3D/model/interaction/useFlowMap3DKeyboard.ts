import { cameraKeyAction } from '@/scene3d/camera/cameraKeys'
import { firstSpot, lastSpot, nextSpot } from '@/scene3d/input/spatialNav'
import { isPrintable, typeaheadMatch } from '@components/BaseFlowMap/model/a11y/flowFocus'
import type { FlowMap3DKeyboardOptions } from '../../types/internal/flowMap3dInternal.types'
import type { Scene3DDirection, Scene3DSpot } from '@/scene3d/types/internal/scene3dGeometry.types'

const TYPEAHEAD_MS = 700
const LETTER = /\p{L}/u
const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'])
const DIRECTIONS: Record<string, Scene3DDirection> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }

function visibleSpots(options: FlowMap3DKeyboardOptions): Scene3DSpot[] {
	return [...options.labels.spots].flatMap(([id, spot]) => (spot.isVisible ? [{ id, x: spot.x, y: spot.y }] : []))
}

function along(options: FlowMap3DKeyboardOptions, direction: 1 | -1): string | null {
	const id = options.focus.focused.value
	if (!id) return null
	const graph = options.model.graph.value
	const links = direction === 1 ? graph.outgoing(id) : graph.incoming(id)
	return (direction === 1 ? links[0]?.target : links[0]?.source) ?? null
}

function useTypeahead(options: FlowMap3DKeyboardOptions) {
	let buffer = ''
	let timer: ReturnType<typeof setTimeout> | undefined
	return {
		type(key: string): void {
			buffer += key
			clearTimeout(timer)
			timer = setTimeout(() => (buffer = ''), TYPEAHEAD_MS)
			const items = options.model.shown.value.nodes.map(node => ({ id: node.id, label: node.label }))
			const found = typeaheadMatch(items, buffer, options.focus.focused.value)
			if (found) options.focus.move(found)
		},
		reset(): void {
			buffer = ''
			clearTimeout(timer)
		},
		isTyping: () => buffer !== '',
		stop: () => clearTimeout(timer),
	}
}

const BRACKETS = new Set(['[', ']'])

function startsSearch(event: KeyboardEvent, isTyping: () => boolean): boolean {
	if (!isPrintable(event)) return false
	if (BRACKETS.has(event.key)) return false
	return isTyping() || (event.shiftKey && LETTER.test(event.key))
}

function runCamera(options: FlowMap3DKeyboardOptions, event: KeyboardEvent): boolean {
	const action = cameraKeyAction(event, { hasQuarterTurns: true })
	if (!action) return false
	const { camera } = options
	if (action.type === 'rotate') {
		if (Math.abs(action.degrees) >= 90) camera.rotate(action.degrees > 0 ? 1 : -1)
		else camera.turn(action.degrees)
	} else if (action.type === 'tilt') camera.tilt(action.degrees)
	else if (action.type === 'zoom') (action.direction > 0 ? camera.zoomIn : camera.zoomOut)()
	else camera.home()
	return true
}

export function useFlowMap3DKeyboard(options: FlowMap3DKeyboardOptions) {
	const { focus, pick } = options
	const typeahead = useTypeahead(options)
	const focusedId = () => focus.focused.value
	const move = (spot: Scene3DSpot | null) => spot && focus.move(spot.id)
	const keys: Record<string, () => void> = {
		Home: () => move(firstSpot(visibleSpots(options))),
		End: () => move(lastSpot(visibleSpots(options))),
		']': () => focus.move(along(options, 1) ?? focusedId()),
		'[': () => focus.move(along(options, -1) ?? focusedId()),
		Enter: () => void (focusedId() && pick.pick({ entity: 'node', id: focusedId() as string })),
		' ': () => void (focusedId() && pick.pick({ entity: 'node', id: focusedId() as string })),
		Escape: () => pick.clear(),
	}

	function runKey(event: KeyboardEvent): boolean {
		const direction = event.shiftKey ? undefined : DIRECTIONS[event.key]
		const handler = keys[event.key] as (() => void) | undefined
		const isPlain = !event.ctrlKey && !event.metaKey && !event.altKey
		if (!direction && !(handler && isPlain)) return false
		event.preventDefault()
		if (direction) move(nextSpot(visibleSpots(options), focusedId(), direction))
		else handler?.()
		return true
	}

	function onKeydown(event: KeyboardEvent): void {
		if (event.target !== event.currentTarget) return
		if (startsSearch(event, typeahead.isTyping)) return typeahead.type(event.key)
		if (!isPrintable(event) && !MODIFIER_KEYS.has(event.key)) typeahead.reset()
		if (runKey(event)) return typeahead.reset()
		if (runCamera(options, event)) event.preventDefault()
		else if (isPrintable(event)) typeahead.type(event.key)
	}

	return { onKeydown, isTyping: typeahead.isTyping, stop: typeahead.stop }
}
