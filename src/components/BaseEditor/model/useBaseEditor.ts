import type { ComputedRef, Ref } from 'vue'
import { UI_EDITOR } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { createEditorApi } from './editorExpose'
import { useEditorField } from './useEditorField'
import { EDITOR_MENU_SCALE_RATIO } from './editorScale'
import { useEditorComposition } from './editorComposition'
import { consumeEcho, rememberEmitted } from './editorDraft'
import { useEditorSelectionSync } from './editorSelectionSync'
import type { BaseSelectOption } from '@components/BaseSelect'
import { escapeHtml, sanitizeHtml } from '@utils/dom/htmlUtils'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useFormDisabled } from '@composables/form/useFormContext'
import { useEditorState } from '@composables/editor/useEditorState'
import { useEditorToolbar } from '@composables/editor/useEditorToolbar'
import type { EditorComposition } from '../types/EditorComposition.types'
import { isLinkHotkey, useEditorLinkDialog } from './useEditorLinkDialog'
import type { BaseEditorEmits, EditorProps } from '../types/BaseEditor.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

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

function getRangeFromPoint(x: number, y: number): Range | null {
	if (typeof document.caretPositionFromPoint === 'function') {
		const position = document.caretPositionFromPoint(x, y)
		if (!position) return null
		const range = document.createRange()
		range.setStart(position.offsetNode, position.offset)
		return range
	}
	return typeof document.caretRangeFromPoint === 'function' ? document.caretRangeFromPoint(x, y) : null
}

function useEditorEngine(
	emit: BaseEditorEmits,
	refs: { editorRef: Ref<HTMLDivElement | null>; codeTextareaRef: Ref<{ textareaRef: HTMLTextAreaElement | null } | null> },
	options: { isLocked: ComputedRef<boolean>; sanitize: (html: string) => string; pending: string[] },
) {
	const composition = useEditorComposition(() => handleInput())
	const toolbar = useEditorToolbar({
		...refs,
		onInput: () => handleInput(),
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
	function handleInput(): void {
		if (composition.isActive) {
			state.checkEmpty()
			return
		}
		if (toolbar.isCodeMode.value) {
			emitValue(options.sanitize(toolbar.codeContent.value))
			return
		}
		if (!refs.editorRef.value) return
		toolbar.convertInlineHtml()
		emitValue(options.sanitize(refs.editorRef.value.innerHTML))
		toolbar.updateActiveStates()
		state.checkEmpty()
	}
	return { toolbar, state, handleInput, composition }
}

function useSafeInsert(isLocked: ComputedRef<boolean>, sanitize: (html: string) => string) {
	const isInternalDrag = ref(false)
	return {
		isInternalDrag,
		handlePaste(event: ClipboardEvent): void {
			const data = event.clipboardData
			if (isLocked.value || !data) return
			const html = data.getData('text/html')
			const text = data.getData('text/plain')
			if (!html && !text) return
			event.preventDefault()
			document.execCommand('insertHTML', false, html ? sanitize(html) : escapeHtml(text).replace(/\r?\n/g, '<br>'))
		},
		handleDrop(event: DragEvent): void {
			const html = event.dataTransfer?.getData('text/html')
			if (isLocked.value || isInternalDrag.value || !html) return
			event.preventDefault()
			const range = getRangeFromPoint(event.clientX, event.clientY)
			if (range) {
				const selection = window.getSelection()
				selection?.removeAllRanges()
				selection?.addRange(range)
			}
			document.execCommand('insertHTML', false, sanitize(html))
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
			if (options.composition.isActive) return
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
			if (ctx.composition.isActive || consumeEcho(ctx.pending, newVal)) return
			if (toolbar.isCodeMode.value) {
				toolbar.codeContent.value = ctx.sanitize(newVal)
				return
			}
			if (!editorRef.value || editorRef.value.innerHTML === newVal) return
			editorRef.value.innerHTML = ctx.sanitize(newVal)
			state.checkEmpty()
		},
	)
	onMounted(() => {
		if (editorRef.value && props.modelValue) editorRef.value.innerHTML = ctx.sanitize(props.modelValue)
		state.checkEmpty()
		state.refreshTextColor()
		if (props.isAutofocus) editorRef.value?.focus()
	})
}

function useEditorFocus(emit: BaseEditorEmits, engine: ReturnType<typeof useEditorEngine>, formField: { onBlur: () => void }) {
	return {
		handleFocus(): void {
			if (typeof document.execCommand === 'function') document.execCommand('defaultParagraphSeparator', false, 'p')
			engine.state.refreshTextColor()
			engine.state.isFocused.value = true
			emit('focus')
		},
		handleBlur(): void {
			formField.onBlur()
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
	const sanitize = (html: string): string => (props.sanitize ?? sanitizeHtml)(html)
	const pending: string[] = []
	const engine = useEditorEngine(emit, { editorRef, codeTextareaRef }, { isLocked, sanitize, pending })
	const insert = useSafeInsert(isLocked, sanitize)
	const link = useEditorLinkDialog(engine.toolbar, isLocked)
	const mediaMenu = useMediaMenu(editorRef, engine.toolbar, { composition: engine.composition, openLinkDialog: link.openLinkDialog })
	useContentSync(props, editorRef, { isLocked, sanitize, engine, pending, composition: engine.composition })
	const api = createEditorApi({
		editorRef,
		toolbar: engine.toolbar,
		isLocked,
		isEmpty: engine.state.isEmpty,
		sanitize,
		handleInput: engine.handleInput,
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
		handleCompositionStart: engine.composition.handleCompositionStart,
		handleCompositionEnd: engine.composition.handleCompositionEnd,
		mediaMenuAnchor: mediaMenu.mediaMenuAnchor,
		...engine.state,
		handleInput: engine.handleInput,
		handleKeyDown: mediaMenu.handleKeyDown,
		...insert,
		exposed: api.exposed,
		toolbarSlotProps: api.slotProps,
		...useEditorFocus(emit, engine, field.formField),
	}
}
