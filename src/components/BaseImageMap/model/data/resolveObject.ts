import { isSafeUrl } from '@utils/data/urlUtils'
import type { ResolvedImageMapObject } from '../../types/imageMapModel.types'
import type {
	ImageMapAction,
	ImageMapData,
	ImageMapGroup,
	ImageMapObject,
	ImageMapStateStyle,
	ImageMapStyle,
} from '../../types/imageMapData.types'

const STATES = ['base', 'hover', 'active'] as const

function groupStyle(group: ImageMapGroup | undefined, data: ImageMapData): ImageMapStyle {
	const named = group?.style ? data.styles?.[group.style] : undefined
	if (!group?.color) return named ?? {}
	return { ...named, base: { fill: group.color, stroke: group.color, ...named?.base } }
}

function objectStyle(object: ImageMapObject, data: ImageMapData): ImageMapStyle {
	if (typeof object.style === 'string') return data.styles?.[object.style] ?? {}
	return object.style ?? {}
}

function mergeStyles(base: ImageMapStyle, own: ImageMapStyle): Required<ImageMapStyle> {
	return {
		base: { ...base.base, ...own.base },
		hover: { ...base.hover, ...own.hover },
		active: { ...base.active, ...own.active },
	}
}

function stateVariables(state: ImageMapStateStyle, suffix: string): Record<string, string> {
	const variables: Record<string, string> = {}
	if (state.fill) variables[`--im-fill${suffix}`] = state.fill
	if (state.fillOpacity !== undefined) variables[`--im-fill-opacity${suffix}`] = String(state.fillOpacity)
	if (state.stroke) variables[`--im-stroke${suffix}`] = state.stroke
	if (state.strokeWidth !== undefined) variables[`--im-stroke-width${suffix}`] = `${state.strokeWidth}px`
	return variables
}

function toVariables(style: Required<ImageMapStyle>): Record<string, string> {
	return Object.assign({}, ...STATES.map(state => stateVariables(style[state], state === 'base' ? '' : `-${state}`)))
}

function resolveAction(object: ImageMapObject, defaultAction: ImageMapAction, data: ImageMapData): ImageMapAction {
	const action = object.action ?? defaultAction
	if (action === 'link' && !(object.link && isSafeUrl(object.link))) return 'none'
	if (action === 'layer' && !data.layers.some(layer => layer.id === object.targetLayer)) return 'none'
	return action
}

export function resolveObject(object: ImageMapObject, data: ImageMapData, defaultAction: ImageMapAction): ResolvedImageMapObject {
	const group = data.groups?.find(item => item.id === object.group)
	const action = resolveAction(object, defaultAction, data)
	return {
		object,
		group,
		action,
		href: action === 'link' ? object.link : undefined,
		style: toVariables(mergeStyles(groupStyle(group, data), objectStyle(object, data))),
		isDisabled: Boolean(object.isDisabled),
	}
}
