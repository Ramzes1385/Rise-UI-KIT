<template>
	<BaseModal
		:is-open="isOpen"
		:title="title"
		dialog-role="alertdialog"
		:aria-describedby="description ? descriptionId : undefined"
		:variant="variant"
		:size-scale="sizeScale"
		:color="color"
		:custom-class="{ root: classes.root, content: 'base-confirm' }"
		@close="finish(false)"
		@after-leave="emit('after-leave')">
		<p v-if="description" :id="descriptionId" class="base-confirm__description" :class="classes.description">{{ description }}</p>
		<template #footer>
			<!-- Фокус при открытии: на «Отмене» для необратимых действий, иначе на подтверждении -->
			<BaseButton
				variant="outline"
				:size-scale="sizeScale"
				:custom-class="classes.cancel"
				:autofocus="isDanger"
				@click="finish(false)">
				{{ cancelLabel ?? UI_TEXT.CANCEL }}
			</BaseButton>
			<BaseButton
				:size-scale="sizeScale"
				:color="isDanger ? dangerColor : undefined"
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
import { kitDefaults } from '@composables/useDefaults'
import { useBaseConfirm } from '../model/useBaseConfirm'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseConfirmEmits, BaseConfirmProps } from '../types/BaseConfirm.types'

const props = withDefaults(
	defineProps<BaseConfirmProps>(),
	kitDefaults('BaseConfirm', {
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
		isDanger: false,
	}),
)

const emit = defineEmits<BaseConfirmEmits>()

const { classes, dangerColor, descriptionId, finish } = useBaseConfirm(props, emit)
</script>
