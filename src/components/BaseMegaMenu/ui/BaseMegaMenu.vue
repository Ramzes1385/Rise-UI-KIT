<template>
	<nav
		ref="rootRef"
		:class="[ui('root'), variantClass, { 'base-mega-menu--mobile': isMobileMode, 'base-mega-menu--open': openItem }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="navLabel"
		@focusout="handleFocusOut">
		<div :class="[ui('bar'), classes.bar]">
			<button
				v-if="isMobileMode"
				type="button"
				:class="ui('toggle')"
				:aria-expanded="isMobileOpen"
				:aria-controls="listId"
				@click="toggleMobile">
				<BaseIcon :name="isMobileOpen ? 'close' : 'menu'" :size-scale="iconScale" />
				<span>{{ mobileToggleLabel }}</span>
			</button>

			<Transition name="base-mega-menu-reveal" :css="!isMotionReduced">
				<ul v-show="!isMobileMode || isMobileOpen" :id="listId" ref="listRef" :class="[ui('list'), classes.list]" role="list">
					<li
						v-for="item in items"
						:key="getItemKey(item)"
						:class="ui('item')"
						@pointerenter="handleItemEnter(item, $event)"
						@pointerleave="handleLeave">
						<button
							v-if="hasPanel(item)"
							:id="triggerId(item)"
							type="button"
							:class="[
								ui('trigger'),
								{ 'base-mega-menu__trigger--open': isOpen(item), 'base-mega-menu__trigger--active': item.isActive },
								classes.trigger,
							]"
							:disabled="item.isDisabled"
							:aria-current="item.isActive || undefined"
							:aria-expanded="isOpen(item)"
							:aria-controls="panelId(item)"
							@click="handleTriggerClick(item)"
							@keydown="handleTriggerKeydown($event, item, items ?? [])">
							<BaseIcon v-if="item.icon" :name="item.icon" :size-scale="iconScale" class="base-mega-menu__trigger-icon" />
							<span class="base-mega-menu__trigger-label">{{ item.label }}</span>
							<BaseIcon name="chevron-down" :size-scale="iconScale" class="base-mega-menu__chevron" />
						</button>

						<BaseLink
							v-else
							:id="triggerId(item)"
							:class="[ui('trigger'), { 'base-mega-menu__trigger--active': item.isActive }, classes.trigger]"
							:aria-current="item.isActive ? 'page' : undefined"
							variant="ghost"
							:to="item.to"
							:href="item.href"
							:target="item.target"
							:is-disabled="item.isDisabled"
							@click="select(item, $event)"
							@keydown="handleTriggerKeydown($event, item, items ?? [])">
							<BaseIcon v-if="item.icon" :name="item.icon" :size-scale="iconScale" class="base-mega-menu__trigger-icon" />
							<span class="base-mega-menu__trigger-label">{{ item.label }}</span>
						</BaseLink>

						<Transition name="base-mega-menu-reveal" :css="!isMotionReduced">
							<div
								v-if="isMobileMode && isOpen(item)"
								:id="panelId(item)"
								:class="[ui('panel'), 'base-mega-menu__panel--inline', classes.panel]"
								@keydown="handlePanelKeydown">
								<MegaMenuPanel
									:item="item"
									:classes="classes"
									:ui="ui"
									:is-motion-reduced="isMotionReduced"
									:hover-delays="hoverDelays"
									@select="select">
									<template v-if="$slots.link" #link="slotProps">
										<slot name="link" v-bind="slotProps" />
									</template>

									<template v-if="$slots.promo" #promo="slotProps">
										<slot name="promo" v-bind="slotProps" />
									</template>
								</MegaMenuPanel>
							</div>
						</Transition>
					</li>
				</ul>
			</Transition>

			<div v-if="$slots.end" :class="ui('end')">
				<slot name="end" />
			</div>
		</div>

		<Transition name="base-mega-menu-panel" :css="!isMotionReduced">
			<div
				v-if="openItem && !isMobileMode"
				:id="panelId(openItem)"
				:class="[ui('panel'), classes.panel]"
				@pointerenter="handlePanelEnter"
				@pointerleave="handleLeave"
				@keydown="handlePanelKeydown">
				<Transition name="base-mega-menu-swap" :css="!isMotionReduced">
					<MegaMenuPanel
						:key="getItemKey(openItem)"
						:item="openItem"
						:classes="classes"
						:ui="ui"
						:is-motion-reduced="isMotionReduced"
						:hover-delays="hoverDelays"
						@select="select">
						<template v-if="$slots.link" #link="slotProps">
							<slot name="link" v-bind="slotProps" />
						</template>

						<template v-if="$slots.promo" #promo="slotProps">
							<slot name="promo" v-bind="slotProps" />
						</template>
					</MegaMenuPanel>
				</Transition>
			</div>
		</Transition>
	</nav>
</template>

<script setup lang="ts">
import '@components/BaseIcon/styles/BaseIcon.style.scss'
import '@components/BaseLink/styles/BaseLink.style.scss'
import '../styles/BaseMegaMenu.style.scss'
import MegaMenuPanel from './MegaMenuPanel.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { useBaseMegaMenu } from '../model/useBaseMegaMenu'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseMegaMenuEmits, BaseMegaMenuProps, BaseMegaMenuSlots } from '../types/BaseMegaMenu.types'

defineOptions({ name: 'BaseMegaMenu' })

const props = withDefaults(
	defineProps<BaseMegaMenuProps>(),
	kitDefaults('BaseMegaMenu', {
		variant: DEFAULT_VARIANT,
		items: () => [],
		trigger: 'hover',
		openDelay: 150,
		closeDelay: 300,
		mobileBreakpoint: 'md',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseMegaMenuEmits>()
defineSlots<BaseMegaMenuSlots>()

const {
	ui,
	isMotionReduced,
	rootRef,
	listRef,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	navLabel,
	mobileToggleLabel,
	iconScale,
	listId,
	openItem,
	isMobileMode,
	isMobileOpen,
	toggleMobile,
	getItemKey,
	hasPanel,
	hoverDelays,
	isOpen,
	triggerId,
	panelId,
	select,
	close,
	handleTriggerClick,
	handleTriggerKeydown,
	handlePanelKeydown,
	handleItemEnter,
	handleLeave,
	handlePanelEnter,
	handleFocusOut,
} = useBaseMegaMenu(props, emit)

defineExpose({ close })
</script>
