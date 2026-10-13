import type { ComputedRef, Ref } from 'vue'
import { UI_EDITOR } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { EDITOR_MENU_SCALE_RATIO } from './editorScale'
import type { BaseSelectOption } from '@components/BaseSelect'
import { escapeHtml, sanitizeHtml } from '@utils/dom/htmlUtils'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useEditorState } from '@composables/editor/useEditorState'
import { useEditorToolbar } from '@composables/editor/useEditorToolbar'
import type { BaseEditorEmits, EditorProps } from '../types/BaseEditor.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { isolateFormField, useFormDisabled } from '@composables/form/useFormContext'

const EDITOR_ELEMENTS = ['root', 'toolbar', 'btn', 'group', 'colorPicker', 'headingSelect', 'fileInput', 'content', 'code']

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
	options: { isLocked: ComputedRef<boolean>; sanitize: (html: string) => string },
) {
	let handleInput: () => void = () => {}
	const toolbar = useEditorToolbar({
		...refs,
		onInput: () => handleInput(),
		promptForUrl: () => prompt(UI_EDITOR.URL_PROMPT),
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
	handleInput = () => {
		if (toolbar.isCodeMode.value) {
			emit('update:modelValue', options.sanitize(toolbar.codeContent.value))
			return
		}
		if (!refs.editorRef.value) return
		toolbar.convertInlineHtml()
		emit('update:modelValue', options.sanitize(refs.editorRef.value.innerHTML))
		toolbar.updateActiveStates()
		state.checkEmpty()
	}
	return { toolbar, state, handleInput: (): void => handleInput() }
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

function useMediaMenu(editorRef: Ref<HTMLDivElement | null>, toolbar: ReturnType<typeof useEditorToolbar>): void {
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
}

function useContentSync(
	props: EditorProps,
	editorRef: Ref<HTMLDivElement | null>,
	ctx: { isLocked: ComputedRef<boolean>; sanitize: (html: string) => string; engine: ReturnType<typeof useEditorEngine> },
): void {
	const { toolbar, state } = ctx.engine
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
			if (!editorRef.value || editorRef.value.innerHTML === newVal) return
			editorRef.value.innerHTML = ctx.sanitize(newVal)
			state.checkEmpty()
		},
	)
	onMounted(() => {
		if (editorRef.value && props.modelValue) editorRef.value.innerHTML = ctx.sanitize(props.modelValue)
		state.checkEmpty()
		if (props.isAutofocus) editorRef.value?.focus()
	})
}

export function useBaseEditor(props: EditorProps, emit: BaseEditorEmits) {
	const isLocked = useFormDisabled(() => props.isReadonly)
	isolateFormField()
	const standard = useStandardBaseComponent('base-editor', props, EDITOR_ELEMENTS)
	const editorRef = ref<HTMLDivElement | null>(null)
	const codeTextareaRef = ref<{ textareaRef: HTMLTextAreaElement | null } | null>(null)
	const sanitize = (html: string): string => (props.sanitize ?? sanitizeHtml)(html)
	const engine = useEditorEngine(emit, { editorRef, codeTextareaRef }, { isLocked, sanitize })
	const insert = useSafeInsert(isLocked, sanitize)
	useMediaMenu(editorRef, engine.toolbar)
	const mediaMenuAnchor = computed(() => ({ x: engine.toolbar.contextMenu.x, y: engine.toolbar.contextMenu.y }))
	useContentSync(props, editorRef, { isLocked, sanitize, engine })

	return {
		...standard,
		ui: useUi(props, 'base-editor'),
		isLocked,
		editorRef,
		codeTextareaRef,
		menuControlScale: computed(() => props.sizeScale * EDITOR_MENU_SCALE_RATIO),
		headingOptions: headingOptions(),
		...engine.toolbar,
		mediaMenuAnchor,
		...engine.state,
		handleInput: engine.handleInput,
		...insert,
		handleFocus(): void {
			engine.state.isFocused.value = true
			emit('focus')
		},
		handleBlur(): void {
			engine.toolbar.saveSelection()
			engine.state.isFocused.value = false
			emit('blur')
		},
	}
}
