import { codeLength } from './card/cardText'
import { UI_CARD } from '@/locales/messages'
import { useCardFields } from './useCardFields'
import { formatMessage } from '@/locales/state'
import { cardBrandName } from './card/cardErrors'
import { computed, ref, useId, watch } from 'vue'
import { formatCardNumber } from '@utils/form/cardUtils'
import { useCardInputHandlers } from './useCardInputHandlers'
import { CARD_INPUT_FIELDS } from '../types/BaseCardInput.types'
import { CARD_BRAND_ICON_PATHS } from '../types/cardBrandIcons.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { isolateFormField, useFieldControl, useFormDisabled } from '@composables/form/useFormContext'
import type { BaseCardInputEmits, BaseCardInputExpose, BaseCardInputProps, CardInputField } from '../types/BaseCardInput.types'

const AUTOCOMPLETE: Record<CardInputField, string> = { number: 'cc-number', expiry: 'cc-exp', code: 'cc-csc', holder: 'cc-name' }
const NUMBER_PLACEHOLDER_LENGTH = 16
const CODE_PLACEHOLDER_LENGTH = 3

function fieldAttrs(field: CardInputField): Record<string, string> {
	const typing: Record<string, string> = field === 'holder' ? { autocapitalize: 'characters' } : { inputmode: 'numeric' }
	return { 'data-card-field': field, autocomplete: AUTOCOMPLETE[field], autocorrect: 'off', spellcheck: 'false', ...typing }
}

function visibleFields(props: BaseCardInputProps): CardInputField[] {
	return CARD_INPUT_FIELDS.filter(field => field !== 'holder' || props.hasHolder !== false)
}

function useCardFieldViews(props: BaseCardInputProps, fields: ReturnType<typeof useCardFields>) {
	const labels = computed<Record<CardInputField, string>>(() => ({
		number: UI_CARD.NUMBER,
		expiry: UI_CARD.EXPIRY,
		code: fields.brand.value ? `${UI_CARD.CODE} ${fields.brand.value.code.name}` : UI_CARD.CODE,
		holder: UI_CARD.HOLDER,
	}))
	const placeholders = computed<Record<CardInputField, string>>(() => ({
		number: formatCardNumber('0'.repeat(NUMBER_PLACEHOLDER_LENGTH), fields.brand.value),
		expiry: UI_CARD.EXPIRY_PLACEHOLDER,
		code: '0'.repeat(fields.brand.value ? codeLength(fields.brand.value) : CODE_PLACEHOLDER_LENGTH),
		holder: UI_CARD.HOLDER_PLACEHOLDER,
	}))
	return computed(() =>
		visibleFields(props).map(field => ({
			field,
			label: labels.value[field],
			placeholder: placeholders.value[field],
			text: fields.texts[field],
			error: fields.errors.value[field],
			attrs: fieldAttrs(field),
		})),
	)
}

function useCardBrandView(props: BaseCardInputProps, fields: ReturnType<typeof useCardFields>) {
	return computed(() => {
		const brand = fields.brand.value
		if (!brand) return null
		const name = cardBrandName(brand)
		return {
			name,
			label: formatMessage(UI_CARD.BRAND, { brand: name }),
			image: props.brandIcons?.[brand.id],
			path: CARD_BRAND_ICON_PATHS[brand.id],
		}
	})
}

function useCardExpose(props: BaseCardInputProps, fields: ReturnType<typeof useCardFields>, focusField: (field: CardInputField) => void) {
	const exposed: BaseCardInputExpose = {
		getCardData: fields.getCardData,
		tokenize() {
			const data = fields.getCardData()
			if (!props.tokenize) return Promise.reject(new Error(UI_CARD.NO_TOKENIZER))
			return data ? props.tokenize(data) : Promise.reject(new Error(UI_CARD.INCOMPLETE))
		},
		validate: fields.validate,
		reset: fields.reset,
		focus: field => focusField(field ?? visibleFields(props).find(item => fields.rawErrors.value[item] !== null) ?? 'number'),
	}
	return exposed
}

export function useBaseCardInput(props: BaseCardInputProps, emit: BaseCardInputEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const errorId = `${useId()}-error`
	const control = useFieldControl({
		isLabelable: false,
		hasError: () => Boolean(props.error),
		isRequired: () => Boolean(props.isRequired),
		describedBy: () => (props.error ? errorId : undefined),
	})
	isolateFormField()
	const fields = useCardFields(props)
	const handlers = useCardInputHandlers(props, fields, rootRef)
	watch(fields.summary, (next, previous) => {
		emit('update:modelValue', next)
		if (next.isComplete && !previous.isComplete) emit('complete', next)
	})
	watch(
		() => props.modelValue,
		next => {
			if (next === null) fields.reset()
		},
	)
	return {
		...useStandardBaseComponent('base-card-input', props, ['root', 'legend', 'number', 'expiry', 'code', 'holder', 'brand', 'error']),
		rootRef,
		errorId,
		control,
		isControlDisabled: useFormDisabled(() => props.isDisabled),
		fieldViews: useCardFieldViews(props, fields),
		brandView: useCardBrandView(props, fields),
		handleInput: handlers.handleInput,
		handleKeydown: handlers.handleKeydown,
		handleBlur: fields.touch,
		exposed: useCardExpose(props, fields, handlers.focusField),
	}
}
