import { pickInDirection } from '@components/BaseImageMap/model/interaction/spatial'
import type { SceneKeyboardOptions } from '../../types/internal/imageMap3dInternal.types'
import type { Center } from '@components/BaseImageMap/types/internal/imageMapInternal.types'
import type { ImageMapDirection } from '@components/BaseImageMap/types/internal/imageMapModel.types'

const ARROWS: Record<string, ImageMapDirection> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }
const LAYER_KEYS: Record<string, 1 | -1> = { PageUp: 1, PageDown: -1 }

function firstId(centers: Center[], options: SceneKeyboardOptions): string | undefined {
	const active = options.getActive()
	return centers.find(center => center.id === active)?.id ?? centers[0]?.id
}

function nextId(key: string, centers: Center[], options: SceneKeyboardOptions): string | undefined {
	const current = centers.find(center => center.id === options.getFocus())
	if (key === 'Home') return centers[0]?.id
	if (key === 'End') return centers[centers.length - 1]?.id
	if (!current) return firstId(centers, options)
	return pickInDirection(current, centers, ARROWS[key]) ?? current.id
}

function isMoveKey(event: KeyboardEvent): boolean {
	return (event.key in ARROWS && !event.shiftKey) || event.key === 'Home' || event.key === 'End'
}

export function useSceneKeyboard(options: SceneKeyboardOptions) {
	function handle(event: KeyboardEvent, focused: string | null): boolean {
		if (isMoveKey(event)) {
			const id = nextId(event.key, options.centers(), options)
			if (id) options.focus(id)
			return Boolean(id)
		}
		if ((event.key === 'Enter' || event.key === ' ') && focused) {
			options.activate(focused, event)
			return true
		}
		if (event.key === 'Escape' && focused) {
			options.focus(null)
			return true
		}
		if (event.key in LAYER_KEYS) options.stepLayer(LAYER_KEYS[event.key])
		return event.key in LAYER_KEYS
	}

	return function onSceneKey(event: KeyboardEvent): boolean {
		if (event.ctrlKey || event.metaKey || event.altKey || event.target !== event.currentTarget) return false
		const isHandled = handle(event, options.getFocus())
		if (isHandled) event.preventDefault()
		return isHandled
	}
}
