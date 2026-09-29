import { computed, ref } from 'vue'
import { UI_EDITOR } from '@/locales/messages'
import { calcIconScale } from '@utils/media/iconUtils'
import { EDITOR_MENU_SCALE_RATIO } from './editorScale'
import type { BaseEditorToolbarProps, ToolbarButton } from '../types/BaseEditorToolbar.types'

function inlineGroups(): { key: string; items: ToolbarButton[] }[] {
	return [
		{
			key: 'format',
			items: [
				{ icon: 'bold', label: UI_EDITOR.BOLD, activeKey: 'isBold', action: 'bold', type: 'format' },
				{ icon: 'italic', label: UI_EDITOR.ITALIC, activeKey: 'isItalic', action: 'italic', type: 'format' },
				{ icon: 'underline', label: UI_EDITOR.UNDERLINE, activeKey: 'isUnderline', action: 'underline', type: 'format' },
				{ icon: 'strike', label: UI_EDITOR.STRIKETHROUGH, activeKey: 'isStrike', action: 'strikeThrough', type: 'format' },
			] as ToolbarButton[],
		},
		{
			key: 'align',
			items: [
				{ icon: 'align-left', label: UI_EDITOR.ALIGN_LEFT, activeKey: 'isJustifyLeft', action: 'justifyLeft', type: 'format' },
				{
					icon: 'align-center',
					label: UI_EDITOR.ALIGN_CENTER,
					activeKey: 'isJustifyCenter',
					action: 'justifyCenter',
					type: 'format',
				},
				{ icon: 'align-right', label: UI_EDITOR.ALIGN_RIGHT, activeKey: 'isJustifyRight', action: 'justifyRight', type: 'format' },
				{
					icon: 'align-justify',
					label: UI_EDITOR.ALIGN_JUSTIFY,
					activeKey: 'isJustifyFull',
					action: 'justifyFull',
					type: 'format',
				},
			] as ToolbarButton[],
		},
	]
}

function blockGroups(): { key: string; items: ToolbarButton[] }[] {
	return [
		{
			key: 'list',
			items: [
				{
					icon: 'list-bullet',
					label: UI_EDITOR.LIST_BULLET,
					activeKey: 'isUnorderedList',
					action: 'insertUnorderedList',
					type: 'format',
				},
				{
					icon: 'list-number',
					label: UI_EDITOR.LIST_NUMBERED,
					activeKey: 'isOrderedList',
					action: 'insertOrderedList',
					type: 'format',
				},
			] as ToolbarButton[],
		},
		{
			key: 'block',
			items: [
				{ icon: 'quote', label: UI_EDITOR.QUOTE, activeKey: 'isBlockquote', action: 'blockquote', type: 'block' },
				{ icon: 'code', label: UI_EDITOR.CODE_BLOCK, activeKey: 'isPre', action: 'pre', type: 'block' },
			] as ToolbarButton[],
		},
	]
}

export function useBaseEditorToolbar(props: BaseEditorToolbarProps) {
	return {
		headingValue: ref<string | number>('p'),
		textColorModel: ref(props.textColor),
		backgroundColorModel: ref(props.backgroundColor),
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		controlScale: computed(() => props.sizeScale * EDITOR_MENU_SCALE_RATIO),
		colorPickerClasses: computed(() => ({ swatch: props.classes.colorPicker })),
		buttonGroups: computed(() => [...inlineGroups(), ...blockGroups()]),
	}
}
