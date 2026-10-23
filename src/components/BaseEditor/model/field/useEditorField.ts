import { computed, useId } from 'vue'
import { formFieldValue } from './editorValue'
import { sanitizeHtml } from '@utils/dom/htmlUtils'
import { useFormField } from '@composables/form/useFormField'
import type { EditorProps } from '../../types/BaseEditor.types'
import { isolateFormField, useFieldControl } from '@composables/form/useFormContext'

export function useEditorField(props: EditorProps) {
	const ownId = useId()
	const labelId = `${ownId}-label`
	const errorId = `${ownId}-error`
	const formValue = computed(() => formFieldValue((props.sanitize ?? sanitizeHtml)(props.modelValue)))
	const formField = useFormField({ value: () => formValue.value, error: () => props.error, isRequired: () => props.isRequired })
	const control = useFieldControl({
		describedBy: () => (formField.error ? errorId : undefined),
		hasError: () => Boolean(formField.error),
		isRequired: () => props.isRequired,
		isLabelable: false,
		hasOwnLabel: () => Boolean(props.label),
	})
	isolateFormField()
	return {
		labelId,
		errorId,
		control,
		formField,
		formValue,
		contentId: control.id,
		labelledBy: computed(() => (props.label ? labelId : control.fieldLabelId.value)),
	}
}
