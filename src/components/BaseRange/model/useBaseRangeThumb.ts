import type { BaseRangeThumbEmits, BaseRangeThumbProps } from '../types/BaseRangeThumb.types'

export function useBaseRangeThumb(props: BaseRangeThumbProps, emit: BaseRangeThumbEmits) {
	return {
		emitDown: (event: MouseEvent | TouchEvent): void => emit('down', { event, index: props.index }),
		emitKeydown: (event: KeyboardEvent): void => emit('keydown', { event, index: props.index }),
	}
}
