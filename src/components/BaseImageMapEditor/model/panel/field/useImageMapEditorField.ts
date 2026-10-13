import { computed, ref, watch } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import type { ImageMapEditorFieldEmits, ImageMapEditorFieldProps } from '../../../types/ImageMapEditorField.types'

export function useImageMapEditorField(props: ImageMapEditorFieldProps, emit: ImageMapEditorFieldEmits) {
	const text = computed(() => (typeof props.field.value === 'string' ? props.field.value : ''))
	const draft = ref<string | null>(null)
	const shown = computed(() => draft.value ?? text.value)
	const tokenValue = computed(() => (props.field.options?.some(option => option.value === text.value) ? text.value : ''))
	const tokenLabel = computed(() => formatMessage(UI_IMAGE_MAP_EDITOR.COLOR_FROM_PALETTE, { label: props.field.label }))
	watch(text, () => {
		draft.value = null
	})

	return {
		shown,
		tokenValue,
		tokenLabel,
		input(value: string | null | undefined): void {
			draft.value = String(value ?? '')
			emit('update', draft.value)
		},
		pickToken(value: string): void {
			if (value || tokenValue.value) emit('update', value)
		},
		blur(): void {
			const value = shown.value
			draft.value = null
			if (props.field.isTrimmedOnBlur && value !== value.trim()) emit('update', value.trim())
		},
	}
}
