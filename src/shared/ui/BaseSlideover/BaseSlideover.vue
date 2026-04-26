<template>
	<teleport to="body">
		<transition name="slideover">
			<div
				v-if="isOpen"
				class="base-slideover"
				:class="[`base-slideover--${side}`, isFullWidth && 'base-slideover--full']"
				:style="widthStyle"
				@click.self="handleOverlayClick">
				<div
					class="base-slideover__panel"
					:class="[`base-slideover__panel--${side}`, isFullWidth && 'base-slideover__panel--full']">
					<!-- Заголовок -->
					<div v-if="hasHeader" class="base-slideover__header">
						<slot name="header">
							<BaseText v-if="title" tag="h3" :weight="600" class="base-slideover__title">{{ title }}</BaseText>
						</slot>
						<BaseButton variant="ghost" aria-label="Закрыть" :padding="2" @click="handleClose">
							<BaseIcon name="close" />
						</BaseButton>
					</div>

					<!-- Тело -->
					<div class="base-slideover__body">
						<slot />
					</div>

					<!-- Подвал -->
					<footer v-if="hasFooter" class="base-slideover__footer">
						<slot name="footer" />
					</footer>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { usePopup } from '@/shared/composables/usePopup'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { useSlots } from 'vue'
import './BaseSlideover.style.scss'
import type { BaseSlideoverEmits, BaseSlideoverProps } from './BaseSlideover.types'

const props = withDefaults(defineProps<BaseSlideoverProps>(), {
	side: 'right',
	width: 100,
	isFullWidth: false,
	closeOnOverlay: true,
	closeOnEscape: true,
})

/** Стиль для масштабирования ширины панели */
const widthStyle = computed(() => {
	if (props.isFullWidth || props.width === 100) return undefined
	return { '--slideover-width-scale': String(props.width / 100) }
})

const emit = defineEmits<BaseSlideoverEmits>()
const slots = useSlots()

/** Есть ли header */
const hasHeader = !!slots.header || !!props.title

/** Есть ли footer */
const hasFooter = !!slots.footer

/** Popup-паттерн: оверлей, Escape, блокировка скролла */
const { handleOverlayClick, close: handleClose } = usePopup({
	isOpen: () => props.isOpen,
	closeOnOverlay: () => props.closeOnOverlay ?? true,
	closeOnEscape: () => props.closeOnEscape ?? true,
	onClose: () => {
		emit('update:isOpen', false)
		emit('close')
	},
})
</script>
