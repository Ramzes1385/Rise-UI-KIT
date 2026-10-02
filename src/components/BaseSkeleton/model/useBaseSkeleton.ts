import { computed } from 'vue'
import { nonNegativeProp } from '@utils/form/numberPropUtils'
import type { SkeletonProps } from '../types/BaseSkeleton.types'
import { useCustomClass } from '@composables/base/useCustomClass'

const CSS_KEYWORD = /^[a-z-]+$/i

function scaleDimension(value: number | string, scale: number): string {
	if (typeof value === 'number') return `${value * scale}px`
	if (scale === 1 || CSS_KEYWORD.test(value.trim())) return value
	return `calc(${value} * ${scale})`
}

function checkedDimension(prop: 'width' | 'height', value: number | string | undefined): number | string | undefined {
	if (typeof value === 'string') return value.trim() === '' ? undefined : value
	if (value === undefined) return undefined
	return nonNegativeProp({ component: 'BaseSkeleton', prop, value })
}

function skeletonStyles(
	props: SkeletonProps,
	{ width, height }: Record<'width' | 'height', number | string | undefined>,
): Record<string, string> {
	const styles: Record<string, string> = {}
	const scale = props.sizeScale / 100
	if (width !== undefined) styles.width = scaleDimension(width, scale)
	if (height !== undefined) styles.height = scaleDimension(height, scale)
	if (props.color) styles.backgroundColor = props.color
	if (scale !== 1) styles['--size-scale'] = String(scale)
	return styles
}

export function useBaseSkeleton(props: SkeletonProps) {
	const width = computed(() => checkedDimension('width', props.width))
	const height = computed(() => checkedDimension('height', props.height))
	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root'] }),
		skeletonStyle: computed(() => skeletonStyles(props, { width: width.value, height: height.value })),
	}
}
