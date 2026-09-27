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
			<BaseButton variant="outline" :size-scale="sizeScale" :custom-class="classes.cancel" :autofocus="isDanger" @click="finish(false)">
				{{ cancelLabel }}
			</BaseButton>
			<BaseButton :size-scale="sizeScale" :color="isDanger ? DANGER_COLOR : undefined" :custom-class="classes.confirm" :autofocus="!isDanger" @click="finish(true)">
				{{ confirmLabel }}
			</BaseButton>
		</template>
	</BaseModal>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseModal } from '@components/BaseModal'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, UI_TEXT } from '@constants'
import '../styles/BaseConfirm.style.scss'
import type { BaseConfirmEmits, BaseConfirmProps } from '../model/BaseConfirm.types'
import type { CustomColor } from '@composables/useCustomColor'

const props = withDefaults(defineProps<BaseConfirmProps>(), kitDefaults('BaseConfirm', {
	variant: DEFAULT_VARIANT,
	sizeScale: SIZE_SCALE_DEFAULT,
	confirmLabel: UI_TEXT.CONFIRM,
	cancelLabel: UI_TEXT.CANCEL,
	isDanger: false,
}))

const emit = defineEmits<BaseConfirmEmits>()

const { classes } = useStandardBaseComponent('base-confirm', props, ['root', 'description', 'cancel', 'confirm'])

/** Кнопка необратимого действия — цвет ошибки из токенов темы */
const DANGER_COLOR: CustomColor = {
	bg: { base: 'var(--rise-error)', hover: 'var(--rise-error-hover)' },
	text: { base: 'var(--rise-on-error)' },
}

const descriptionId = useId()

/** Закрывает окно с результатом. `close` идёт первым: по нему BaseApp разрешает промис useConfirm() */
function finish(result: boolean): void {
	if (!props.isOpen) return
	emit('close', result)
	emit('update:isOpen', false)
	if (result) emit('confirm')
	else emit('cancel')
}
</script>
