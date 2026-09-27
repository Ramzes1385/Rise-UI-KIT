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
import { computed, ref, watch } from 'vue'
import { BaseLoader } from '@components/BaseLoader'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { UI_TEXT, SIZE_SCALE_DEFAULT} from '@constants'
import '../styles/BaseForm.style.scss'
import type { BaseFormEmits, BaseFormProps, BaseFormSlots } from '../model/BaseForm.types'

const props = withDefaults(defineProps<BaseFormProps>(), {
	isLoading: false,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

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

function handleSubmit(e: Event): void {
	if (!props.isLoading && !props.isDisabled) {
		emit('submit', e)
	}
}
</script>
