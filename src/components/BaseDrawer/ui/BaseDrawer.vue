<template>
	<teleport defer :to="teleportTarget">
		<transition name="base-drawer">
			<div
				v-if="isOpen"
				:class="[
					ui('root'),
					animationClass,
					`base-drawer--${direction}`,
					{ 'base-drawer--no-overlay': !hasOverlay, 'base-drawer--dragging': isDragging },
					classes.root,
				]"
				:style="[sizeScaleStyle, customColorStyle, layerStyle]"
				v-bind="themeAttrs"
				@click.self="handleOverlayClick">
				<div
					ref="panelRef"
					:class="[ui('panel'), `base-drawer__panel--${direction}`, classes.panel]"
					:style="dragStyle"
					role="dialog"
					aria-modal="true"
					:aria-labelledby="hasDefaultTitle ? titleId : undefined"
					:aria-label="hasDefaultTitle ? undefined : ariaLabel"
					:aria-describedby="description ? descriptionId : undefined"
					@pointerdown="handlePointerdown"
					@pointermove="handlePointermove"
					@pointerup="handlePointerup"
					@pointercancel="resetDrag">
					<div v-if="hasHandle" :class="[ui('handle'), classes.handle]" aria-hidden="true" />
					<div v-if="hasHeader" :class="[ui('header'), classes.header]">
						<slot name="header">
							<BaseText
								:id="titleId"
								tag="h2"
								:weight="TEXT_WEIGHT.SEMIBOLD"
								:class="ui('title')"
								:custom-class="classes.title">
								{{ title }}
							</BaseText>
						</slot>
						<BaseButton variant="ghost" :class="ui('close')" :aria-label="UI_ARIA.CLOSE" @click="handleClose">
							<BaseIcon name="close" />
						</BaseButton>
					</div>
					<p v-if="description" :id="descriptionId" :class="ui('description')">{{ description }}</p>
					<div ref="bodyRef" :class="[ui('body'), classes.body]" :tabindex="isBodyScrollable ? 0 : undefined">
						<slot />
					</div>
					<footer v-if="slots.footer" :class="[ui('footer'), classes.footer]">
						<slot name="footer" />
					</footer>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import '@components/BaseText/styles/BaseText.style.scss'
import '../styles/BaseDrawer.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { useBaseDrawer } from '../model/useBaseDrawer'
import { kitDefaults } from '@composables/base/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseDrawerEmits, BaseDrawerProps, BaseDrawerSlots } from '../types/BaseDrawer.types'

const props = withDefaults(
	defineProps<BaseDrawerProps>(),
	kitDefaults('BaseDrawer', {
		variant: DEFAULT_VARIANT,
		direction: 'bottom',
		hasHandle: true,
		isDraggable: true,
		closeOnOverlay: true,
		closeOnEscape: true,
		hasOverlay: true,
		sizeScale: SIZE_SCALE_DEFAULT,
		animation: 'slide',
	}),
)
const emit = defineEmits<BaseDrawerEmits>()
defineSlots<BaseDrawerSlots>()

const {
	sizeScaleStyle,
	customColorStyle,
	classes,
	slots,
	teleportTarget,
	layerStyle,
	titleId,
	descriptionId,
	hasHeader,
	hasDefaultTitle,
	handleOverlayClick,
	handleClose,
	panelRef,
	bodyRef,
	isBodyScrollable,
	isDragging,
	dragStyle,
	resetDrag,
	handlePointerdown,
	handlePointermove,
	handlePointerup,
	ui,
	animationClass,
	themeAttrs,
} = useBaseDrawer(props, emit)
</script>
