<template>
	<form
		ref="formRef"
		class="base-form"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-form--loading': isLoading,
				'base-form--disabled': isDisabled,
			},
			variantClass,
			classes.root,
		]"
		:aria-busy="isLoading || undefined"
		@submit.prevent="handleSubmit">
		<!-- Оверлей загрузки: вне загрузки скрыт через visibility — лоадер со статусом «Загрузка» не виден и скринридеру -->
		<div class="base-form__overlay" :class="[{ 'base-form__overlay--visible': isLoading }, classes.overlay]">
			<BaseLoader variant="spinner" :has-label="true" :label="UI_TEXT.LOADING" :size-scale="sizeScale" />
		</div>

		<!-- Контент формы -->
		<div class="base-form__content" :class="classes.content">
			<!-- fieldset[disabled] отключает все нативные контролы: pointer-events блокирует только мышь, но не клавиатуру.
				role="presentation" — обёртка чисто поведенческая, скринридеру не нужна лишняя группа -->
			<fieldset class="base-form__fieldset" :disabled="isLocked" role="presentation">
				<slot />
			</fieldset>
		</div>
	</form>
</template>

<script setup lang="ts">
import { computed, nextTick, provide, ref, watch } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { BaseLoader } from '@components/BaseLoader'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { FORM_CONTEXT_KEY } from '@composables/useFormContext'
import { issuesToErrors, validateSchema } from '@utils/formUtils'
import '../styles/BaseForm.style.scss'
import type { BaseFormEmits, BaseFormExpose, BaseFormProps, BaseFormSlots } from '../model/BaseForm.types'
import type { FormValidationResult } from '@utils/formUtils'

const props = withDefaults(defineProps<BaseFormProps>(), kitDefaults('BaseForm', {
	variant: DEFAULT_VARIANT,
	isLoading: false,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-form', props, ['root', 'overlay', 'content'])

const emit = defineEmits<BaseFormEmits>()
defineSlots<BaseFormSlots>()

const formRef = ref<HTMLFormElement | null>(null)

/** Поля заблокированы: форма отключена или отправляется */
const isLocked = computed(() => props.isLoading || props.isDisabled)

/** Элемент формы, который был в фокусе перед блокировкой */
let focusedBeforeLock: HTMLElement | null = null

// flush 'pre': запоминаем фокус до патча DOM — после disabled браузер переводит фокус на body
watch(isLocked, locked => {
	if (!locked) return
	const active = document.activeElement
	focusedBeforeLock = active instanceof HTMLElement && formRef.value?.contains(active) ? active : null
})

// Возвращаем фокус после разблокировки, чтобы клавиатурный пользователь не терял позицию после отправки;
// не перехватываем его, если за время блокировки фокус уже перевели на другой элемент
watch(isLocked, locked => {
	const target = focusedBeforeLock
	if (locked || !target) return
	focusedBeforeLock = null
	const active = document.activeElement
	if (target.isConnected && (!active || active === document.body)) target.focus()
}, { flush: 'post' })

/** Ошибки проверки схемой: имя поля → текст (их показывают BaseFormField с тем же name) */
const errors = ref<Record<string, string>>({})

/** Была попытка отправки: с этого момента схема проверяет данные при каждом изменении */
const isSubmitted = ref(false)

/** Номер проверки: ответ асинхронной схемы, пришедший после более новой проверки, не показывается */
let validationRun = 0

async function validate(): Promise<FormValidationResult> {
	const run = ++validationRun
	if (!props.schema) {
		errors.value = {}
		return { value: props.state, issues: [] }
	}
	const result = await validateSchema(props.schema, props.state)
	if (run === validationRun) errors.value = issuesToErrors(result.issues)
	return result
}

function reset(): void {
	validationRun++
	isSubmitted.value = false
	errors.value = {}
}

// После первой отправки ошибки исчезают по мере исправления полей
watch(
	() => props.state,
	() => {
		if (isSubmitted.value) void validate()
	},
	{ deep: true },
)

/** Первое поле с ошибкой получает фокус: клавиатурный пользователь и скринридер сразу у проблемы */
async function focusFirstInvalid(): Promise<void> {
	await nextTick()
	formRef.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}

async function handleSubmit(e: Event): Promise<void> {
	if (isLocked.value) return
	if (!props.schema) {
		emit('submit', e, props.state)
		return
	}
	isSubmitted.value = true
	const result = await validate()
	if (result.issues.length > 0) {
		emit('invalid', result.issues)
		await focusFirstInvalid()
		return
	}
	emit('submit', e, result.value)
}

// Вложенные контролы и поля: блокировка кастомных контролов (fieldset блокирует только нативные) и ошибки схемы
provide(FORM_CONTEXT_KEY, {
	isDisabled: isLocked,
	errors: computed(() => errors.value),
})

defineExpose<BaseFormExpose>({
	validate,
	reset,
	get errors() {
		return errors.value
	},
})
</script>
