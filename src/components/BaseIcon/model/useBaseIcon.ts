import { computed } from 'vue'
import { useUi } from '@composables/base/useUi'
import { useIcon } from '@composables/app/useIcon'
import type { BaseIconProps } from '../types/BaseIcon.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

const DIRECTIONAL_ICONS = new Set(['arrow-left', 'arrow-right', 'chevron-left', 'chevron-right', 'undo', 'redo', 'reply', 'send'])

function iconTransform(props: BaseIconProps): string {
	const transforms: string[] = []
	if (props.rotate) transforms.push(`rotate(${props.rotate}deg)`)
	if (props.isFlipX) transforms.push('scaleX(-1)')
	if (props.isFlipY) transforms.push('scaleY(-1)')
	return transforms.join(' ')
}

export function useBaseIcon(props: BaseIconProps) {
	const { resolveIcon } = useIcon()

	return {
		...useStandardBaseComponent('base-icon', props, ['root', 'svg']),
		ui: useUi(props, 'base-icon'),
		icon: computed(() => resolveIcon(props.name)),
		isDirectional: computed(() => DIRECTIONAL_ICONS.has(props.name)),
		isDecorative: computed(() => !props.ariaLabel),
		iconStyle: computed(() => {
			const styles: Record<string, string> = {}
			if (props.color) styles.color = props.color
			const transform = iconTransform(props)
			if (transform) styles.transform = transform
			return styles
		}),
	}
}
