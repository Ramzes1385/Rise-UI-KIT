import { UI_FLOW_C4 } from '@/locales/messages'
import type { C4ZoomLevel } from '../../../types/notations/architecture/c4.types'

export const C4_ZOOM_LEVELS: C4ZoomLevel[] = [
	{ minZoom: 0.45, depth: 0, label: () => UI_FLOW_C4.LEVEL_CONTEXT },
	{ minZoom: 0.85, depth: 1, label: () => UI_FLOW_C4.LEVEL_CONTAINERS },
]
