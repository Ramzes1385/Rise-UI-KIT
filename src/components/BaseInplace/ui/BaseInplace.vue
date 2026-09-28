<template>
	<!--
		Текст, который редактируется на месте: в просмотре — кнопка (имя — «что: значение», подсказка «Нажмите, чтобы
		изменить»), по клику, Enter или пробелу — поле. Enter сохраняет, Escape отменяет; фокус возвращается на кнопку
	-->
	<span
		class="base-inplace"
		:class="[variantClass, { 'base-inplace--editing': isEditing }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<button
			v-if="!isEditing"
			ref="displayRef"
			type="button"
			class="base-inplace__display"
			:class="[{ 'base-inplace__display--empty': !modelValue }, classes.display]"
			:disabled="isControlDisabled"
			:aria-label="`${label}: ${modelValue || placeholder}`"
			:aria-describedby="hintId"
			@click="edit">
			<slot name="display" :value="modelValue">{{ modelValue || placeholder }}</slot>
		</button>
		<BaseInput
			v-else
			ref="inputRef"
			v-model="draft"
			class="base-inplace__field"
			:aria-label="label"
			:size-scale="sizeScale"
			:custom-class="{ root: classes.field }"
			@keydown="handleKeydown"
			@blur="handleBlur" />
		<span :id="hintId" class="base-inplace__hint">{{ UI_ARIA.INPLACE_HINT }}</span>
	</span>
</template>

<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useFormDisabled } from '@composables/useFormContext'
import '../styles/BaseInplace.style.scss'
import type { BaseInplaceEmits, BaseInplaceProps, BaseInplaceSlots } from '../model/BaseInplace.types'

const props = withDefaults(
	defineProps<BaseInplaceProps>(),
	kitDefaults('BaseInplace', {
		variant: DEFAULT_VARIANT,
		modelValue: '',
		placeholder: '—',
		isDisabled: false,
		isSaveOnBlur: true,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseInplaceEmits>()
defineSlots<BaseInplaceSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-inplace', props, [
	'root',
	'display',
	'field',
])

const hintId = `${useId()}-hint`
const displayRef = ref<HTMLButtonElement | null>(null)
const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)
const isEditing = ref(false)
const draft = ref('')

/** Блокировка: свой isDisabled или неактивная BaseForm вокруг */
const isControlDisabled = useFormDisabled(() => props.isDisabled)

/** Режим правки: поле с текущим текстом, фокус и выделение в нём */
async function edit(): Promise<void> {
	if (isControlDisabled.value) return
	draft.value = props.modelValue
	isEditing.value = true
	await nextTick()
	inputRef.value?.focus()
	inputRef.value?.inputRef?.select()
}

async function finish(): Promise<void> {
	isEditing.value = false
	await nextTick()
	displayRef.value?.focus()
}

async function save(): Promise<void> {
	if (!isEditing.value) return
	const value = draft.value.trim()
	if (value !== props.modelValue) emit('update:modelValue', value)
	emit('save', value)
	await finish()
}

async function cancel(): Promise<void> {
	if (!isEditing.value) return
	emit('cancel')
	await finish()
}

function handleKeydown(event: KeyboardEvent): void {
	if (event.key === 'Enter') {
		event.preventDefault()
		void save()
	} else if (event.key === 'Escape') {
		// preventDefault: Escape отменяет правку и не закрывает окно вокруг
		event.preventDefault()
		void cancel()
	}
}

function handleBlur(): void {
	if (props.isSaveOnBlur) void save()
	else void cancel()
}

defineExpose({ edit, save, cancel })
</script>
