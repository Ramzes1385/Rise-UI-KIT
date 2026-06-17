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
								:weight="UI_FONT_WEIGHT.SEMIBOLD"
								class="base-slideover__title"
								:custom-class="classes.title"
								>{{ title }}</BaseText
							>
						</slot>
						<BaseButton variant="ghost" :aria-label="UI_ARIA.CLOSE" :padding="2" @click="handleClose">
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

import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { usePadding } from '@composables/usePadding'
import { usePopup } from '@composables/usePopup'
import { UI_ARIA, UI_FONT_WEIGHT } from '@constants'
import '../styles/BaseSlideover.style.scss'
import type { BaseSlideoverEmits, BaseSlideoverProps } from '../model/BaseSlideover.types'

const props = withDefaults(defineProps<BaseSlideoverProps>(), {
	side: 'right',
	width: 100,
	isFullWidth: false,
	closeOnOverlay: true,
	closeOnEscape: true,
	isContained: false,
	hasOverlay: true,
	padding: 24,
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

const hasHeader = computed(() => Boolean(slots.header) || Boolean(props.title))
const hasFooter = computed(() => Boolean(slots.footer))

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
