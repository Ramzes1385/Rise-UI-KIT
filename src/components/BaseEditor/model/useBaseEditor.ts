import type { ComputedRef, Ref } from 'vue'
import { UI_EDITOR } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { createEditorApi } from './api/editorExpose'
import { EDITOR_MENU_SCALE_RATIO } from './editorScale'
import { useEditorField } from './field/useEditorField'
import { createEditorInput } from './input/editorInput'
import type { DropPoint } from '../types/EditorApi.types'
import type { BaseSelectOption } from '@components/BaseSelect'
import { escapeHtml, sanitizeHtml } from '@utils/dom/htmlUtils'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useEditorComposition } from './input/editorComposition'
import { stripPlaceholders } from '@utils/dom/editorFormatUtils'
import { consumeEcho, rememberEmitted } from './input/editorDraft'
import { useFormDisabled } from '@composables/form/useFormContext'
import { useEditorState } from '@composables/editor/useEditorState'
import { useEditorSelectionSync } from './input/editorSelectionSync'
import type { EditorInputHandlers } from '../types/EditorInput.types'
import { useEditorToolbar } from '@composables/editor/useEditorToolbar'
import type { EditorComposition } from '../types/EditorComposition.types'
import { rangeFromStatic, selectRange } from '@utils/dom/editorInsertUtils'
import type { BaseEditorEmits, EditorProps } from '../types/BaseEditor.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { isLinkHotkey, useEditorLinkDialog } from './link/useEditorLinkDialog'

const EDITOR_ELEMENTS = [
	'root',
	'toolbar',
	'btn',
	'group',
	'colorPicker',
	'headingSelect',
	'fileInput',
	'content',
	'code',
	'label',
	'required',
	'errorText',
]
const MENU_KEY = 'ContextMenu'

function isMediaMenuKey(event: KeyboardEvent): boolean {
	return event.key === MENU_KEY || (event.key === 'F10' && event.shiftKey)
}

function headingOptions(): BaseSelectOption[] {
	return [
		{ value: 'p', label: UI_EDITOR.PARAGRAPH },
		...[1, 2, 3, 4, 5, 6].map(level => ({ value: `h${level}`, label: `${UI_EDITOR.HEADING_PREFIX} ${level}` })),
	]
}

function useEditorEngine(
	emit: BaseEditorEmits,
	refs: { editorRef: Ref<HTMLDivElement | null>; codeTextareaRef: Ref<{ textareaRef: HTMLTextAreaElement | null } | null> },
	options: { isLocked: ComputedRef<boolean>; sanitize: (html: string) => string; pending: string[] },
) {
	const handlers = {} as EditorInputHandlers
	const composition = useEditorComposition(() => handlers.handleInput('typing'))
	const toolbar = useEditorToolbar({
		...refs,
		onInput: kind => handlers.handleInput(kind),
		onRestore: () => handlers.restore(),
		isReadonly: () => options.isLocked.value,
		sanitize: options.sanitize,
	})
	const state = useEditorState({
		editorRef: refs.editorRef,
		applyColor: toolbar.applyColor,
		applyBackgroundColor: toolbar.applyBackgroundColor,
		resetColor: toolbar.resetColor,
		resetBackgroundColor: toolbar.resetBackgroundColor,
	})
	const emitValue = (value: string): void => {
		rememberEmitted(options.pending, value)
		emit('update:modelValue', value)
	}
	Object.assign(
		handlers,
		createEditorInput({ editorRef: refs.editorRef, sanitize: options.sanitize, emitValue, composition, toolbar, state }),
	)
	const handleCompositionStart = (): void => {
		composition.handleCompositionStart()
		toolbar.history.capture()
	}
	return { toolbar, state, handleInput: handlers.handleInput, composition, handleCompositionStart }
}

function plainTextToHtml(text: string): string {
	return escapeHtml(text).replace(/\r?\n/g, '<br>')
}

function getRangeFromPoint(point: DropPoint): Range | null {
	if (typeof document.caretPositionFromPoint === 'function') {
		const position = document.caretPositionFromPoint(point.x, point.y)
		if (!position) return null
		const range = document.createRange()
		range.setStart(position.offsetNode, position.offset)
		return range
	}
	return typeof document.caretRangeFromPoint === 'function' ? document.caretRangeFromPoint(point.x, point.y) : null
}

function selectDropTarget(event: InputEvent, point: DropPoint | null): void {
	const target = event.getTargetRanges?.()[0]
	const range = target ? rangeFromStatic(target) : point && getRangeFromPoint(point)
	if (range) selectRange(range)
}

function useSafeInsert(
	isLocked: ComputedRef<boolean>,
	options: { sanitize: (html: string) => string; engine: ReturnType<typeof useEditorEngine> },
) {
	const { toolbar, composition } = options.engine
	const isInternalDrag = ref(false)
	const state: { dropPoint: DropPoint | null } = { dropPoint: null }
	function insertFromPaste(event: InputEvent): void {
		const data = event.dataTransfer
		const html = data?.getData('text/html')
		const text = data?.getData('text/plain')
		if (!html && !text) return
		event.preventDefault()
		toolbar.insertHtml(html ? options.sanitize(html) : plainTextToHtml(text ?? ''))
	}
	function insertFromDrop(event: InputEvent): void {
		const html = event.dataTransfer?.getData('text/html')
		if (isInternalDrag.value || !html) return
		event.preventDefault()
		selectDropTarget(event, state.dropPoint)
		toolbar.insertHtml(options.sanitize(html), 'drag')
	}
	return {
		isInternalDrag,
		handleDrop(event: DragEvent): void {
			state.dropPoint = { x: event.clientX, y: event.clientY }
		},
		handleBeforeInput(event: InputEvent): void {
			if (toolbar.history.handleBeforeInput(event, composition.isActive) || isLocked.value) return
			if (event.inputType === 'insertFromPaste') insertFromPaste(event)
			else if (event.inputType === 'insertFromDrop') insertFromDrop(event)
		},
	}
}

function useMediaMenu(
	editorRef: Ref<HTMLDivElement | null>,
	toolbar: ReturnType<typeof useEditorToolbar>,
	options: { composition: EditorComposition; openLinkDialog: () => void },
) {
	const { contextMenu, contextMenuRef } = toolbar
	watch(
		() => contextMenu.isVisible,
		isVisible => {
			if (isVisible) {
				nextTick(() => contextMenuRef.value?.querySelector('input')?.focus())
				return
			}
			if (contextMenuRef.value?.contains(document.activeElement)) editorRef.value?.focus()
		},
	)
	return {
		mediaMenuAnchor: computed(() => ({ x: toolbar.contextMenu.x, y: toolbar.contextMenu.y })),
		handleKeyDown(event: KeyboardEvent): void {
			if (options.composition.isActive || toolbar.history.handleKeyDown(event)) return
			if (isLinkHotkey(event)) {
				event.preventDefault()
				options.openLinkDialog()
				return
			}
			if (!isMediaMenuKey(event) || !toolbar.selectedMedia.value) {
				toolbar.handleKeyDown(event)
				return
			}
			event.preventDefault()
			toolbar.openSelectedMediaMenu()
		},
	}
}

function useContentSync(
	props: EditorProps,
	editorRef: Ref<HTMLDivElement | null>,
	ctx: {
		isLocked: ComputedRef<boolean>
		sanitize: (html: string) => string
		engine: ReturnType<typeof useEditorEngine>
		pending: string[]
		composition: EditorComposition
	},
): void {
	const { toolbar, state } = ctx.engine
	useEditorSelectionSync({ editorRef, isCodeMode: toolbar.isCodeMode, composition: ctx.composition, refresh: toolbar.updateActiveStates })
	watch(
		() => ctx.isLocked.value,
		isReadonly => {
			if (!isReadonly) return
			if (toolbar.isCodeMode.value) toolbar.toggleCodeMode()
			toolbar.closeContextMenu()
		},
	)
	watch(
		() => props.modelValue,
		(newVal: string) => {
			if (consumeEcho(ctx.pending, newVal) || ctx.composition.isActive) return
			if (toolbar.isCodeMode.value) {
				toolbar.codeContent.value = ctx.sanitize(newVal)
				toolbar.history.reset()
				return
			}
			if (!editorRef.value || editorRef.value.innerHTML === newVal) return
			editorRef.value.innerHTML = ctx.sanitize(newVal)
			toolbar.history.reset()
			state.checkEmpty()
		},
	)
	onMounted(() => {
		if (editorRef.value && props.modelValue) editorRef.value.innerHTML = ctx.sanitize(props.modelValue)
		toolbar.history.reset()
		state.checkEmpty()
		state.refreshTextColor()
		if (props.isAutofocus) editorRef.value?.focus()
	})
}

function useEditorFocus(
	emit: BaseEditorEmits,
	engine: ReturnType<typeof useEditorEngine>,
	field: { formField: { onBlur: () => void }; overlays: Ref<HTMLElement | null>[] },
) {
	const isInOwnOverlay = (target: EventTarget | null | undefined): boolean =>
		target instanceof Node && field.overlays.some(overlay => overlay.value?.contains(target))
	return {
		handleFocus(): void {
			if (typeof document.execCommand === 'function') document.execCommand('defaultParagraphSeparator', false, 'p')
			engine.state.refreshTextColor()
			engine.state.isFocused.value = true
			emit('focus')
		},
		handleBlur(event?: FocusEvent): void {
			if (!isInOwnOverlay(event?.relatedTarget)) field.formField.onBlur()
			engine.toolbar.saveSelection()
			engine.state.isFocused.value = false
			emit('blur')
		},
	}
}

export function useBaseEditor(props: EditorProps, emit: BaseEditorEmits) {
	const isDisabled = useFormDisabled(() => props.isDisabled)
	const isLocked = computed(() => props.isReadonly || isDisabled.value)
	const field = useEditorField(props)
	const standard = useStandardBaseComponent('base-editor', props, EDITOR_ELEMENTS)
	const editorRef = ref<HTMLDivElement | null>(null)
	const codeTextareaRef = ref<{ textareaRef: HTMLTextAreaElement | null } | null>(null)
	const sanitize = (html: string): string => (props.sanitize ?? sanitizeHtml)(stripPlaceholders(html))
	const pending: string[] = []
	const engine = useEditorEngine(emit, { editorRef, codeTextareaRef }, { isLocked, sanitize, pending })
	const insert = useSafeInsert(isLocked, { sanitize, engine })
	const link = useEditorLinkDialog(engine.toolbar, isLocked)
	const mediaMenu = useMediaMenu(editorRef, engine.toolbar, { composition: engine.composition, openLinkDialog: link.openLinkDialog })
	useContentSync(props, editorRef, { isLocked, sanitize, engine, pending, composition: engine.composition })
	const api = createEditorApi({
		editorRef,
		toolbar: engine.toolbar,
		isLocked,
		isEmpty: engine.state.isEmpty,
		sanitize,
		formField: field.formField,
		openLinkDialog: link.openLinkDialog,
	})

	return {
		...standard,
		...field,
		ui: useUi(props, 'base-editor'),
		isLocked,
		isDisabled,
		focusContent: (): void => editorRef.value?.focus(),
		editorRef,
		codeTextareaRef,
		menuControlScale: computed(() => props.sizeScale * EDITOR_MENU_SCALE_RATIO),
		headingOptions: headingOptions(),
		...engine.toolbar,
		...link,
		handleCompositionStart: engine.handleCompositionStart,
		handleCompositionEnd: engine.composition.handleCompositionEnd,
		mediaMenuAnchor: mediaMenu.mediaMenuAnchor,
		...engine.state,
		handleInput: engine.handleInput,
		handleKeyDown: mediaMenu.handleKeyDown,
		...insert,
		exposed: api.exposed,
		toolbarSlotProps: api.slotProps,
		...useEditorFocus(emit, engine, { formField: field.formField, overlays: [link.linkDialogRef, engine.toolbar.contextMenuRef] }),
	}
}
