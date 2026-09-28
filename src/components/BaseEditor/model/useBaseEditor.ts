import type { ComputedRef, Ref } from 'vue'
import { UI_EDITOR } from '@/locales/messages'
import { EDITOR_MENU_SCALE_RATIO } from './editorScale'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useLayerIndex } from '@composables/useLayerStack'
import { escapeHtml, sanitizeHtml } from '@utils/htmlUtils'
import { useEditorState } from '@composables/useEditorState'
import type { BaseSelectOption } from '@components/BaseSelect'
/** Composable: логика BaseEditor — визуальный редактор: форматирование, очистка вставленного HTML, режим кода и меню медиа */
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useEditorToolbar } from '@composables/useEditorToolbar'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseEditorEmits, EditorProps } from '../types/BaseEditor.types'
import { isolateFormField, useFormDisabled } from '@composables/useFormContext'
import { useInheritedTheme, useTeleportTarget } from '@composables/useTeleportTarget'

const EDITOR_ELEMENTS = ['root', 'toolbar', 'btn', 'group', 'colorPicker', 'headingSelect', 'fileInput', 'content', 'code']

/** Варианты селекта «Формат»: подписи из текущей локали */
function headingOptions(): BaseSelectOption[] {
	return [
		{ value: 'p', label: UI_EDITOR.PARAGRAPH },
		...[1, 2, 3, 4, 5, 6].map(level => ({ value: `h${level}`, label: `${UI_EDITOR.HEADING_PREFIX} ${level}` })),
	]
}

/** Позиция каретки в точке, куда отпустили перетаскиваемое содержимое */
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
	// handleInput зависит от обоих composables и объявляется после них: ленивый вызов через замыкание разрывает цикл
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
		/* istanbul ignore next -- defensive: editorRef всегда привязан после mount */
		if (!refs.editorRef.value) return
		toolbar.convertInlineHtml()
		emit('update:modelValue', options.sanitize(refs.editorRef.value.innerHTML))
		toolbar.updateActiveStates()
		state.checkEmpty()
	}
	return { toolbar, state, handleInput: (): void => handleInput() }
}

/**
 * Вставка из буфера обмена и перетаскивание: HTML очищается, простой текст вставляется как текст с переносами строк.
 * Без перехвата браузер вставил бы разметку чужой страницы вместе с обработчиками событий
 */
function useSafeInsert(isLocked: ComputedRef<boolean>, sanitize: (html: string) => string) {
	// Перетаскивание внутри редактора браузер выполняет сам: этот HTML уже очищен
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
		/** HTML, перетащенный из другой страницы, вставляется очищенным в точку, куда его отпустили */
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

/** Меню медиа: слой, тема блока и Escape; при открытии фокус в поле «Ширина», при закрытии изнутри — обратно в текст */
function useMediaMenu(editorRef: Ref<HTMLDivElement | null>, toolbar: ReturnType<typeof useEditorToolbar>) {
	const { contextMenu, contextMenuRef, closeContextMenu } = toolbar
	// Тема блока, в котором стоит редактор: меню в body иначе взяло бы тему страницы
	const inheritedTheme = useInheritedTheme(
		() => editorRef.value,
		() => contextMenu.isVisible,
	)
	// Место меню среди открытых слоёв: меню редактора в окне — над окном
	const layerStyle = useLayerIndex(() => contextMenu.isVisible)
	useEscapeKey({ isActive: () => contextMenu.isVisible, callback: closeContextMenu })
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
	return { inheritedTheme, layerStyle }
}

/** Содержимое: v-model записывается в редактор очищенным; режим чтения выходит из режима кода и закрывает меню */
function useContentSync(
	props: EditorProps,
	editorRef: Ref<HTMLDivElement | null>,
	ctx: { isLocked: ComputedRef<boolean>; sanitize: (html: string) => string; engine: ReturnType<typeof useEditorEngine> },
): void {
	const { toolbar, state } = ctx.engine
	// В режиме чтения тулбара нет: из режима кода было бы не выйти, а меню медиа не должно менять документ
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
	// Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo)
	const teleportTarget = useTeleportTarget()
	// Только чтение: свой isReadonly или неактивная BaseForm вокруг (fieldset формы не блокирует contenteditable)
	const isLocked = useFormDisabled(() => props.isReadonly)
	// Поле адреса ссылки и списки панели — служебные: они не становятся полем BaseFormField вокруг редактора
	isolateFormField()
	const standard = useStandardBaseComponent('base-editor', props, EDITOR_ELEMENTS)
	const editorRef = ref<HTMLDivElement | null>(null)
	const codeTextareaRef = ref<{ textareaRef: HTMLTextAreaElement | null } | null>(null)
	// Очистка HTML по пропу sanitize: своя функция или встроенный allowlist
	const sanitize = (html: string): string => (props.sanitize ?? sanitizeHtml)(html)
	const engine = useEditorEngine(emit, { editorRef, codeTextareaRef }, { isLocked, sanitize })
	const insert = useSafeInsert(isLocked, sanitize)
	const menu = useMediaMenu(editorRef, engine.toolbar)
	useContentSync(props, editorRef, { isLocked, sanitize, engine })

	return {
		...standard,
		teleportTarget,
		isLocked,
		editorRef,
		codeTextareaRef,
		// Поля и кнопки меню медиа — размер sm (28px при sizeScale = 100): меню компактнее основных контролов
		menuControlScale: computed(() => props.sizeScale * EDITOR_MENU_SCALE_RATIO),
		headingOptions: headingOptions(),
		...engine.toolbar,
		...engine.state,
		handleInput: engine.handleInput,
		...insert,
		...menu,
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
