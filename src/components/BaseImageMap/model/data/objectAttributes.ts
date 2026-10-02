import type { ObjectState } from '../../types/imageMapInternal.types'
import { IMAGE_MAP_OBJECT_ATTR } from '../../types/imageMapModel.types'
import type { ResolvedImageMapObject } from '../../types/imageMapModel.types'

const OBJECT_CLASS = 'base-image-map__object'

export function objectClasses(item: ResolvedImageMapObject, state: ObjectState): Record<string, boolean> {
	return {
		[`${OBJECT_CLASS}--${item.object.type}`]: true,
		[`${OBJECT_CLASS}--active`]: state.isActive,
		[`${OBJECT_CLASS}--hover`]: state.isHovered,
		[`${OBJECT_CLASS}--disabled`]: item.isDisabled,
		[`${OBJECT_CLASS}--pulsing`]: state.isPulsing,
	}
}

function linkAttributes(item: ResolvedImageMapObject, isNative: boolean): Record<string, string | undefined> {
	if (!isNative) return { role: item.href ? 'link' : 'button' }
	if (!item.href) return {}
	const isExternal = Boolean(item.object.isLinkExternal)
	return { href: item.href, target: isExternal ? '_blank' : undefined, rel: isExternal ? 'noopener noreferrer' : undefined }
}

export function objectAttributes(item: ResolvedImageMapObject, state: ObjectState, isNative: boolean): Record<string, string | undefined> {
	return {
		[IMAGE_MAP_OBJECT_ATTR]: item.object.id,
		...linkAttributes(item, isNative),
		type: isNative && !item.href ? 'button' : undefined,
		tabindex: state.isTabbable ? '0' : '-1',
		'aria-label': item.object.title,
		'aria-disabled': item.isDisabled ? 'true' : undefined,
		'aria-current': state.isActive ? 'true' : undefined,
		'aria-haspopup': item.action === 'popup' ? 'dialog' : undefined,
		'aria-describedby': state.describedBy,
	}
}
