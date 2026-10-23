<template>
	<BaseModal
		:is-open="isOpen"
		:title="title"
		dialog-role="alertdialog"
		:aria-describedby="description ? descriptionId : undefined"
		:variant="variant"
		:size-scale="sizeScale"
		:color="color"
		:animation="animation"
		:ui="{ content: ui('root') }"
		:custom-class="{ root: classes.root }"
		@close="finish(false)"
		@after-leave="emit('after-leave')">
		<p v-if="description" :id="descriptionId" :class="[ui('description'), classes.description]">{{ description }}</p>
		<template #footer>
			<BaseButton
				variant="outline"
				:size-scale="sizeScale"
				:class="ui('cancel')"
				:custom-class="classes.cancel"
				:autofocus="isDanger"
				@click="finish(false)">
				{{ cancelLabel ?? UI_TEXT.CANCEL }}
			</BaseButton>
			<BaseButton
				:size-scale="sizeScale"
				:color="isDanger ? dangerColor : undefined"
				:class="ui('confirm')"
				:custom-class="classes.confirm"
				:autofocus="!isDanger"
				@click="finish(true)">
				{{ confirmLabel ?? UI_TEXT.CONFIRM }}
			</BaseButton>
		</template>
	</BaseModal>
</template>

<script setup lang="ts">
import '../styles/BaseConfirm.style.scss'
import { UI_TEXT } from '@/locales/messages'
import { BaseModal } from '@components/BaseModal'
import { BaseButton } from '@components/BaseButton'
import { useBaseConfirm } from '../model/useBaseConfirm'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseConfirmEmits, BaseConfirmProps } from '../types/BaseConfirm.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseConfirmProps>(),
	kitDefaults('BaseConfirm', {
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
		isDanger: false,
		animation: 'scale',
	}),
)

const emit = defineEmits<BaseConfirmEmits>()

const { classes, ui, dangerColor, descriptionId, finish } = useBaseConfirm(props, emit)
</script>
