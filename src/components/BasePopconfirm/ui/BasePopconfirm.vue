<template>
	<BaseDropdown
		:is-open="isOpenState"
		:position="position"
		:gap="8"
		:variant="variant"
		:color="color"
		:size-scale="sizeScale"
		:prevent-mousedown="false"
		:show-arrow="hasArrow"
		panel-class="base-popconfirm__panel"
		:custom-class="{ root: rootClass, panel: classes.panel, arrow: classes.arrow }"
		@update:is-open="handleDropdownUpdate">
		<span ref="triggerRef" class="base-popconfirm-trigger" :class="classes.trigger" @click="toggle" @keydown="handleTriggerKeydown">
			<slot :is-open="isOpenState" :trigger-props="triggerAttributes" />
		</span>

		<template #dropdown>
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
				<p v-if="description" :id="descriptionId" class="base-popconfirm__description" :class="classes.description">
					{{ description }}
				</p>
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
						:color="isDanger ? dangerColor : undefined"
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
import '../styles/BasePopconfirm.style.scss'
import { UI_TEXT } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseDropdown } from '@components/BaseDropdown'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBasePopconfirm } from '../model/useBasePopconfirm'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BasePopconfirmEmits, BasePopconfirmProps, BasePopconfirmSlots } from '../types/BasePopconfirm.types'

defineOptions({ name: 'BasePopconfirm' })

const props = withDefaults(
	defineProps<BasePopconfirmProps>(),
	kitDefaults('BasePopconfirm', {
		isDanger: false,
		isOpen: undefined,
		position: 'top',
		showArrow: true,
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BasePopconfirmEmits>()
defineSlots<BasePopconfirmSlots>()

const {
	classes,
	hasArrow,
	dangerColor,
	rootClass,
	buttonScale,
	iconScale,
	dialogId,
	titleId,
	descriptionId,
	dialogRef,
	triggerRef,
	triggerAttributes,
	isOpenState,
	finish,
	toggle,
	handleTriggerKeydown,
	handleDropdownUpdate,
	handleKeydown,
} = useBasePopconfirm(props, emit)
</script>
