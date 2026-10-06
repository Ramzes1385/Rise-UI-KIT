import { computed, ref, useId } from 'vue'
import { useUi } from '@composables/base/useUi'
import { useEditorFiles } from './io/useEditorFiles'
import { useEditorTool } from './canvas/useEditorTool'
import { useEditorPanel } from './panel/useEditorPanel'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { useEditorCanvas } from './canvas/useEditorCanvas'
import { useEditorPointer } from './canvas/useEditorPointer'
import { useEditorKeyboard } from './canvas/useEditorKeyboard'
import { useEditorDocument } from './document/useEditorDocument'
import { useEditorSelection } from './document/useEditorSelection'
import type { EditorContext } from '../types/imageMapEditorInternal.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { canvasHelp, toolOptions, useEditorAnnouncer, useEditorZoom } from './useEditorView'
import type { BaseImageMapEditorEmits, BaseImageMapEditorExpose, ImageMapEditorProps } from '../types/BaseImageMapEditor.types'

const CLASS_KEYS = ['root', 'toolbar', 'canvas', 'panel', 'error']

function useCore(props: ImageMapEditorProps, emit: BaseImageMapEditorEmits) {
	const stageRef = ref<HTMLElement | null>(null)
	const svgContainerRef = ref<HTMLElement | null>(null)
	const doc = useEditorDocument(props, emit)
	const selection = useEditorSelection(props, emit, doc.data)
	const announcer = useEditorAnnouncer(emit)
	const ctx: EditorContext = { doc, selection, announcer, getStage: () => stageRef.value, isDisabled: () => props.isDisabled }
	const tool = useEditorTool(props, emit, ctx)
	return { stageRef, svgContainerRef, doc, selection, announcer, ctx, tool }
}

function useCommands(core: ReturnType<typeof useCore>, panel: ReturnType<typeof useEditorPanel>) {
	const { doc, ctx, announcer } = core
	function step(run: () => boolean, message: string): boolean {
		if (ctx.isDisabled() || !run()) return false
		announcer.announce(message)
		return true
	}
	return {
		undo: () => step(doc.undo, UI_IMAGE_MAP_EDITOR.UNDONE),
		redo: () => step(doc.redo, UI_IMAGE_MAP_EDITOR.REDONE),
		deleteSelected: panel.deleteSelected,
		duplicate: panel.duplicate,
	}
}

function useParts(props: ImageMapEditorProps, core: ReturnType<typeof useCore>) {
	const { ctx, tool, selection, doc, svgContainerRef } = core
	const pointer = useEditorPointer(ctx, tool)
	const panel = useEditorPanel(ctx, selection.setLayer, () => props.has3dFields)
	const commands = useCommands(core, panel)
	const keyboard = useEditorKeyboard(props, ctx, { tool, commands })
	const canvas = useEditorCanvas(ctx, tool, {
		svgContainerRef,
		getHover: () => pointer.hover.value,
		getKeyStart: () => keyboard.keyStart.value,
		getCursor: () => keyboard.cursor.value,
	})
	const files = useEditorFiles(ctx, {
		replaceData: doc.replace,
		setLayer: selection.setLayer,
		getFileName: () => props.fileName,
		svgContainerRef,
		svgPrefix: canvas.svgPrefix,
	})
	return { pointer, panel, commands, keyboard, canvas, files }
}

export function useBaseImageMapEditor(props: ImageMapEditorProps, emit: BaseImageMapEditorEmits) {
	const core = useCore(props, emit)
	const { doc, selection, tool, announcer } = core
	const parts = useParts(props, core)

	return {
		...useStandardBaseComponent('base-image-map-editor', props, CLASS_KEYS),
		ui: useUi(props, 'base-image-map-editor'),
		...parts,
		stageRef: core.stageRef,
		svgContainerRef: core.svgContainerRef,
		backgroundInputRef: parts.files.backgroundInputRef,
		jsonInputRef: parts.files.jsonInputRef,
		data: doc.data,
		canUndo: doc.canUndo,
		canRedo: doc.canRedo,
		currentLayer: selection.currentLayer,
		selected: selection.selected,
		select: selection.select,
		setLayer: selection.setLayer,
		tool,
		zoom: useEditorZoom(selection.getLayer),
		status: announcer.status,
		importError: announcer.importError,
		isPreview: ref(false),
		helpId: useId(),
		errorId: useId(),
		toolOptions: computed(toolOptions),
		help: computed(() => canvasHelp(props, tool.tool.value)),
		exposed: {
			undo: parts.commands.undo,
			redo: parts.commands.redo,
			deleteSelected: parts.commands.deleteSelected,
			exportJson: parts.files.exportJson,
			importJson: parts.files.importJson,
			importSvgObjects: parts.files.importSvgObjects,
		} satisfies BaseImageMapEditorExpose,
	}
}
