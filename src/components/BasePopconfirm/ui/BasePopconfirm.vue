<template>
	<BaseDropdown
		:is-open="isOpenState"
		:position="position"
		:gap="8"
		:variant="variant"
		:color="color"
		:size-scale="sizeScale"
		:prevent-mousedown="false"
		panel-class="base-popconfirm__panel"
		:custom-class="{ root: rootClass, panel: classes.panel }"
		@update:is-open="handleDropdownUpdate">
		<span ref="triggerRef" class="base-popconfirm-trigger" :class="classes.trigger" @click="toggle">
			<slot :is-open="isOpenState" :trigger-props="triggerAttributes" />
		</span>

		<template #dropdown>
			<!-- Немодальный диалог-вопрос: имя — вопрос, описание — последствия. Tab ходит между кнопками по кругу -->
			<div
				:id="dialogId"
				ref="dialogRef"
				class="base-popconfirm"
				role="alertdialog"
				:aria-labelledby="titleId"
				:aria-describedby="description ? descriptionId : undefined"
				@keydown="handleKeydown">
				<div class="base-popconfirm__header">
					<BaseIcon v-if="isDanger" class="base-popconfirm__icon" name="alert-triangle" :size-scale="iconScale" />
					<p :id="titleId" class="base-popconfirm__title" :class="classes.title">{{ title }}</p>
				</div>
				<p v-if="description" :id="descriptionId" class="base-popconfirm__description" :class="classes.description">{{ description }}</p>
				<div class="base-popconfirm__actions">
					<BaseButton
						variant="outline"
						:size-scale="buttonScale"
						:custom-class="classes.cancel"
						:data-autofocus="isDanger || undefined"
						@click="finish(false)">
						{{ cancelLabel ?? UI_TEXT.CANCEL }}
					</BaseButton>
					<BaseButton
						:size-scale="buttonScale"
						:color="isDanger ? DANGER_COLOR : undefined"
						:custom-class="classes.confirm"
						:data-autofocus="!isDanger || undefined"
						@click="finish(true)">
						{{ confirmLabel ?? UI_TEXT.CONFIRM }}
					</BaseButton>
				</div>
			</div>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseDropdown } from '@components/BaseDropdown'
import { BaseIcon } from '@components/BaseIcon'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useCustomClass } from '@composables/useCustomClass'
import { kitDefaults } from '@composables/useDefaults'
import { useTriggerAttributes } from '@composables/useTriggerAttributes'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BasePopconfirm.style.scss'
import type { BasePopconfirmEmits, BasePopconfirmProps, BasePopconfirmSlots } from '../model/BasePopconfirm.types'
import type { CustomColor } from '@composables/useCustomColor'

defineOptions({ name: 'BasePopconfirm' })

const props = withDefaults(
	defineProps<BasePopconfirmProps>(),
	kitDefaults('BasePopconfirm', {
		isDanger: false,
		isOpen: undefined,
		position: 'top',
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BasePopconfirmEmits>()
defineSlots<BasePopconfirmSlots>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'trigger', 'panel', 'title', 'description', 'cancel', 'confirm'],
})

/** Кнопка необратимого действия — цвет ошибки из токенов темы, как у BaseConfirm */
const DANGER_COLOR: CustomColor = {
	bg: { base: 'var(--rise-error)', hover: 'var(--rise-error-hover)' },
	text: { base: 'var(--rise-on-error)' },
}

const rootClass = computed((): string => ['base-popconfirm-root', classes.value.root].filter(Boolean).join(' '))
/** Кнопки в панели компактнее основных: размер sm при sizeScale = 100 */
const buttonScale = computed(() => props.sizeScale * 0.875)
const iconScale = computed(() => calcIconScale('sm', props.sizeScale))

const dialogId = `rise-popconfirm-${useId()}`
const titleId = `${dialogId}-title`
const descriptionId = `${dialogId}-description`
const triggerRef = ref<HTMLElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)

const isOpenLocal = ref(props.isOpen ?? false)
const isOpenState = computed(() => isOpenLocal.value)

watch(
	() => props.isOpen,
	isOpen => {
		if (isOpen !== undefined) isOpenLocal.value = isOpen
	},
)

const triggerAttributes = computed(() => ({
	'aria-haspopup': 'dialog',
	'aria-expanded': isOpenState.value ? 'true' : 'false',
	'aria-controls': isOpenState.value ? dialogId : undefined,
}))

const { getTrigger } = useTriggerAttributes(() => triggerRef.value, () => triggerAttributes.value)

function setOpen(value: boolean): void {
	isOpenLocal.value = value
	emit('update:isOpen', value)
}

/** При открытии фокус — на «Отмене» для необратимых действий, иначе на подтверждении */
watch(isOpenLocal, async isOpen => {
	if (!isOpen) return
	await nextTick()
	dialogRef.value?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
})

function toggle(): void {
	if (isOpenLocal.value) finish(false)
	else setOpen(true)
}

/** Ответ: закрыть панель, вернуть фокус на кнопку и сообщить результат */
function finish(isConfirmed: boolean): void {
	setOpen(false)
	getTrigger()?.focus()
	if (isConfirmed) emit('confirm')
	else emit('cancel')
}

/** Escape и клик снаружи — отмена */
function handleDropdownUpdate(value: boolean): void {
	if (!value && isOpenLocal.value) finish(false)
}

/** Tab и Shift+Tab ходят между кнопками по кругу: панель в конце body, и фокус не должен уйти за неё */
function handleKeydown(event: KeyboardEvent): void {
	if (event.key !== 'Tab' || !dialogRef.value) return
	const buttons = [...dialogRef.value.querySelectorAll<HTMLElement>('button:not(:disabled)')]
	const index = buttons.indexOf(document.activeElement as HTMLElement)
	const next = event.shiftKey ? (index <= 0 ? buttons.length - 1 : index - 1) : (index + 1) % buttons.length
	event.preventDefault()
	buttons[next]?.focus()
}
</script>
