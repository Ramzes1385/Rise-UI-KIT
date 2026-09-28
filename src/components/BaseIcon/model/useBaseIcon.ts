import { computed } from 'vue'
import { useIcon } from '@composables/useIcon'
import type { BaseIconProps } from '../types/BaseIcon.types'
import { useStandardBaseComponent } from '@composables/useBaseComponent'

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
		icon: computed(() => resolveIcon(props.name)),
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
