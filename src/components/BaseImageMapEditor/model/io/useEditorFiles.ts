import { ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { addLayer, patchLayer } from '../document/editorOps'
import { sanitizeSvg } from '@components/BaseImageMap/model/svg/sanitizeSvg'
import type { ImageMapLayer } from '@components/BaseImageMap/types/imageMapData.types'
import type { EditorContext, EditorFilesOptions } from '../../types/imageMapEditorInternal.types'
import { downloadText, fileTitle, imageSize, isSvgFile, parseMap, readDataUrl, svgCandidates, svgSize } from './editorFiles'

async function readBackground(file: File): Promise<Partial<ImageMapLayer> | undefined> {
	if (isSvgFile(file)) {
		const svg = await file.text()
		const size = sanitizeSvg(svg, '') ? svgSize(svg) : undefined
		return size && { svg, ...size, image: undefined, svgUrl: undefined }
	}
	const image = await readDataUrl(file)
	const size = await imageSize(image)
	return { image, ...size, svg: undefined, svgUrl: undefined }
}

function inputFile(event: Event): File | undefined {
	const input = event.target as HTMLInputElement
	const file = input.files?.[0]
	input.value = ''
	return file
}

function useBackground(ctx: EditorContext, options: EditorFilesOptions) {
	const backgroundInputRef = ref<HTMLInputElement | null>(null)
	let mode: 'replace' | 'add' = 'replace'

	function applyBackground(file: File, patch: Partial<ImageMapLayer>): void {
		const current = ctx.selection.getLayer()
		if (mode === 'replace' && current) {
			ctx.doc.apply(draft => patchLayer(draft, current.id, patch))
			return
		}
		let created: ImageMapLayer | undefined
		ctx.doc.apply(draft => {
			created = addLayer(draft, { title: fileTitle(file), width: 1, height: 1, ...patch })
		})
		if (created) options.setLayer(created.id)
	}

	return {
		backgroundInputRef,
		openBackground(next: 'replace' | 'add'): void {
			mode = ctx.selection.getLayer() ? next : 'add'
			backgroundInputRef.value?.click()
		},
		async handleBackgroundFile(event: Event): Promise<void> {
			const file = inputFile(event)
			if (!file) return
			const patch = await readBackground(file).catch(() => undefined)
			if (!patch) {
				ctx.announcer.fail(UI_IMAGE_MAP_EDITOR.INVALID_IMAGE)
				return
			}
			applyBackground(file, patch)
			ctx.announcer.announce(formatMessage(UI_IMAGE_MAP_EDITOR.IMAGE_LOADED, { name: file.name }))
		},
	}
}

function useJson(ctx: EditorContext, options: EditorFilesOptions) {
	const jsonInputRef = ref<HTMLInputElement | null>(null)
	function importJson(text: string): boolean {
		const data = parseMap(text)
		if (!data) {
			ctx.announcer.fail(UI_IMAGE_MAP_EDITOR.INVALID_JSON)
			return false
		}
		ctx.selection.select(null)
		options.replaceData(data)
		ctx.announcer.announce(UI_IMAGE_MAP_EDITOR.IMPORTED)
		return true
	}
	const exportJson = (): string => JSON.stringify(ctx.doc.getData(), null, 2)
	return {
		jsonInputRef,
		importJson,
		exportJson,
		openJson: () => jsonInputRef.value?.click(),
		exportFile: () => downloadText(exportJson(), options.getFileName()),
		async handleJsonFile(event: Event): Promise<void> {
			const file = inputFile(event)
			if (file) importJson(await file.text())
		},
	}
}

function useSvgImport(ctx: EditorContext, options: EditorFilesOptions) {
	return function importSvgObjects(): number {
		const layer = ctx.selection.getLayer()
		if (!layer) return 0
		const data = ctx.doc.getData()
		const taken = new Set(data.objects.flatMap(object => (object.type === 'svg' ? [object.elementId] : [])))
		const ids = new Set(data.objects.map(object => object.id))
		const candidates = svgCandidates(options.svgContainerRef.value, options.svgPrefix, taken)
		ctx.doc.apply(draft => {
			for (const { elementId, title } of candidates) {
				const id = ids.has(elementId) ? `svg-${elementId}` : elementId
				draft.objects.push({ type: 'svg', id, elementId, title, layer: layer.id })
			}
		})
		ctx.announcer.announce(formatMessage(UI_IMAGE_MAP_EDITOR.SVG_IMPORTED, { n: candidates.length }))
		return candidates.length
	}
}

export function useEditorFiles(ctx: EditorContext, options: EditorFilesOptions) {
	return {
		...useBackground(ctx, options),
		...useJson(ctx, options),
		importSvgObjects: useSvgImport(ctx, options),
	}
}
