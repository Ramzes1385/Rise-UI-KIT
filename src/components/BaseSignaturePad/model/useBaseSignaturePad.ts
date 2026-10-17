import { computed, ref, useId } from 'vue'
import { useUi } from '@composables/base/useUi'
import { signaturePng } from './signature/signaturePng'
import { formatMessage, pluralize } from '@/locales/state'
import { useSignatureDrawing } from './useSignatureDrawing'
import { UI_PLURAL, UI_SIGNATURE_PAD } from '@/locales/messages'
import { signaturePath, signatureSvg } from './signature/signaturePath'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useFieldControl, useFormDisabled } from '@composables/form/useFormContext'
import type {
	BaseSignaturePadEmits,
	SignatureExportOptions,
	SignaturePadProps,
	SignaturePngOptions,
	SignatureStroke,
} from '../types/BaseSignaturePad.types'

function useSignatureExport(props: SignaturePadProps) {
	const renderOptions = (options: SignatureExportOptions & SignaturePngOptions = {}) => ({
		...options,
		width: props.width,
		height: props.height,
		lineWidth: props.lineWidth,
		color: options.color ?? props.penColor ?? '#000000',
	})
	return {
		toSvg: (options?: SignatureExportOptions): string => signatureSvg(props.modelValue, renderOptions(options)),
		toPng: (options?: SignaturePngOptions): Promise<Blob | null> => signaturePng(props.modelValue, renderOptions(options)),
	}
}

export function useBaseSignaturePad(props: SignaturePadProps, emit: BaseSignaturePadEmits) {
	const ownId = useId()
	const errorId = `${ownId}-error`
	const surfaceRef = ref<SVGSVGElement | null>(null)
	const isControlDisabled = useFormDisabled(() => props.isDisabled)
	const control = useFieldControl({ isLabelable: false, describedBy: () => (props.error ? errorId : undefined) })
	const commit = (strokes: SignatureStroke[]): void => {
		emit('update:modelValue', strokes)
		emit('change', strokes)
	}
	const drawing = useSignatureDrawing({
		surface: () => surfaceRef.value,
		size: () => ({ width: props.width, height: props.height }),
		isEnabled: () => !isControlDisabled.value,
		onStroke: stroke => commit([...props.modelValue, stroke]),
	})
	const strokes = computed(() => (drawing.current.value ? [...props.modelValue, drawing.current.value] : props.modelValue))
	const isEmpty = computed(() => strokes.value.length === 0)
	const undo = (): void => {
		if (props.modelValue.length && !isControlDisabled.value) commit(props.modelValue.slice(0, -1))
	}
	const clear = (): void => {
		if (props.modelValue.length && !isControlDisabled.value) commit([])
	}
	const exporter = useSignatureExport(props)
	return {
		...useStandardBaseComponent('base-signature-pad', props, ['root', 'label', 'surface', 'toolbar', 'error']),
		ui: useUi(props, 'base-signature-pad'),
		labelId: `${ownId}-label`,
		errorId,
		surfaceRef,
		labelledBy: computed(() => (props.label ? `${ownId}-label` : control.fieldLabelId.value)),
		describedBy: computed(() => control.aria.value['aria-describedby']),
		isControlDisabled,
		isEmpty,
		path: computed(() => signaturePath(strokes.value)),
		inkLabel: computed(() =>
			isEmpty.value
				? UI_SIGNATURE_PAD.EMPTY
				: formatMessage(UI_SIGNATURE_PAD.DRAWN, { strokes: pluralize(UI_PLURAL.SIGNATURE_STROKES, strokes.value.length) }),
		),
		handlePointerDown: drawing.handlePointerDown,
		undo,
		clear,
		exposed: { clear, undo, ...exporter },
	}
}
