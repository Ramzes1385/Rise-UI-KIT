<template>
	<teleport :to="teleportTarget" :disabled="isTeleportDisabled">
		<transition name="slideover">
			<div
				v-if="isOpen"
				class="base-slideover"
				:class="[
					`base-slideover--${side}`,
					isFullWidth && 'base-slideover--full',
					isContainedMode && 'base-slideover--contained',
					!hasOverlay && 'base-slideover--no-overlay',
					classes.root,
				]"
				:style="widthStyle"
				@click.self="handleOverlayClick">
				<div
					class="base-slideover__panel"
					:class="[`base-slideover__panel--${side}`, isFullWidth && 'base-slideover__panel--full', classes.panel]"
					:style="panelStyle">
					<!-- Заголовок -->
					<div v-if="hasHeader" class="base-slideover__header" :class="classes.header">
						<slot name="header">
							<BaseText
								v-if="title"
								tag="h3"
								:weight="600"
								class="base-slideover__title"
								:custom-class="classes.title"
								>{{ title }}</BaseText
							>
						</slot>
						<BaseButton variant="ghost" aria-label="Закрыть" :padding="2" @click="handleClose">
							<BaseIcon name="close" />
						</BaseButton>
					</div>

					<!-- Тело -->
					<div class="base-slideover__body" :class="classes.body">
						<slot />
					</div>

					<!-- Подвал -->
					<footer v-if="hasFooter" class="base-slideover__footer" :class="classes.footer">
						<slot name="footer" />
					</footer>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { PropType } from 'vue'

import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { usePadding } from '@composables/usePadding'
import { usePopup } from '@composables/usePopup'
import './BaseSlideover.style.scss'
import type { BaseSlideoverEmits, BaseSlideoverProps } from './BaseSlideover.types'

const props = defineProps({
	customClass: [String, Object] as PropType<BaseSlideoverProps['customClass']>,
	isOpen: { type: Boolean, required: true },
	title: String,
	side: { type: String as PropType<BaseSlideoverProps['side']>, default: 'right' },
	width: { type: Number, default: 100 },
	isFullWidth: { type: Boolean, default: false },
	closeOnOverlay: { type: Boolean, default: true },
	closeOnEscape: { type: Boolean, default: true },
	isContained: { type: Boolean, default: false },
	container: [String, Object] as PropType<BaseSlideoverProps['container']>,
	hasOverlay: { type: Boolean, default: true },
	padding: { type: [Number, Object] as PropType<BaseSlideoverProps['padding']>, default: 24 },
})

const { classes } = useCustomClass({
	getClass: function () {
		return props.customClass
	},
	elementKeys: ['root', 'panel', 'header', 'title', 'body', 'footer'],
})

/** Стиль для масштабирования ширины панели */
const widthStyle = computed(() => {
	if (props.isFullWidth || props.width === 100) return undefined
	return { '--slideover-width-scale': String(props.width / 100) }
})

/** Режим ограничения активен: явный isContained или передан container */
const isContainedMode = computed(() => props.isContained || !!props.container)

/** Цель teleport: переданный контейнер или body по умолчанию */
const teleportTarget = computed<string | HTMLElement>(() => props.container ?? 'body')

/** Отключить teleport только когда нет контейнера и явно contained */
const isTeleportDisabled = computed(() => !props.container && props.isContained)

/**
 * Отступы панели: число задаёт только горизонталь (множитель 1), объект — точечно.
 * omitUnsetSides оставляет вертикаль на дефолтах из SCSS, пока её не зададут явно.
 */
const { paddingStyle: panelStyle } = usePadding({
	getPadding: () => props.padding,
	prefix: '--slideover-pad',
	axisMultiplier: 1,
	defaultPadding: 24,
	omitUnsetSides: true,
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
	closeOnOverlay: () => props.closeOnOverlay,
	closeOnEscape: () => props.closeOnEscape,
	lockScroll: () => !isContainedMode.value,
	onClose: () => {
		emit('update:isOpen', false)
		emit('close')
	},
})
</script>
