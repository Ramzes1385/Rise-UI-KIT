import { computed } from 'vue'
import type { SkeletonProps } from '../types/BaseSkeleton.types'
import { useCustomClass } from '@composables/base/useCustomClass'

function scaleDimension(value: number | string, scale: number): string {
	if (typeof value === 'number') return `${value * scale}px`
	if (scale === 1) return value
	return `calc(${value} * ${scale})`
}

function skeletonStyles(props: SkeletonProps): Record<string, string> {
	const styles: Record<string, string> = {}
	const scale = props.sizeScale / 100
	if (props.width) styles.width = scaleDimension(props.width, scale)
	if (props.height) styles.height = scaleDimension(props.height, scale)
	if (props.color) styles.backgroundColor = props.color
	if (scale !== 1) styles['--size-scale'] = String(scale)
	return styles
}

export function useBaseSkeleton(props: SkeletonProps) {
	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root'] }),
		skeletonStyle: computed(() => skeletonStyles(props)),
	}
}
