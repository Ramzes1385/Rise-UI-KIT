import type { ResizeColumn, ResizeState } from './useColumnResize.types'

export interface ApplyResizeWidthsParams {
	columns: ResizeColumn[]
	state: ResizeState
	minWidth: number
	pageX: number
}
