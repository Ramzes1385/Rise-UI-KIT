import type { FlowExportImageOptions } from '../../types/api/flowController.types'

export async function exportFlowSvg(_options?: FlowExportImageOptions): Promise<string> {
	return ''
}

export async function exportFlowPng(_options?: FlowExportImageOptions): Promise<Blob> {
	return new Blob([], { type: 'image/png' })
}
