<template>
	<nav
		class="base-bottom-nav"
		:class="[variantClass, { 'base-bottom-nav--fixed': isFixed, 'base-bottom-nav--hidden': isHidden }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="navLabel"
		@focusin="handleFocusIn"
		@focusout="handleFocusOut">
		<ul class="base-bottom-nav__list" :class="classes.list">
			<li v-for="entry in entries" :key="entry.item.value" class="base-bottom-nav__item" :class="classes.item">
				<component
					:is="entry.link.is"
					v-bind="entry.link.attrs"
					class="base-bottom-nav__link"
					:class="[
						{ 'base-bottom-nav__link--active': entry.isActive, 'base-bottom-nav__link--disabled': entry.item.isDisabled },
						classes.link,
					]"
					:aria-current="entry.isActive ? 'page' : undefined"
					:aria-describedby="entry.badge ? entry.badgeId : undefined"
					@click="handleItemClick(entry, $event)">
					<span class="base-bottom-nav__icon-wrap">
						<slot name="icon" :item="entry.item" :is-active="entry.isActive">
							<BaseIcon
								:name="entry.icon"
								:size-scale="iconScale"
								class="base-bottom-nav__icon"
								:custom-class="classes.icon" />
						</slot>
						<BaseBadge
							v-if="entry.badge"
							class="base-bottom-nav__badge"
							:custom-class="classes.badge"
							:label="entry.badge.text"
							:size-scale="badgeScale"
							aria-hidden="true" />
					</span>
					<span class="base-bottom-nav__label" :class="classes.label">
						<slot name="label" :item="entry.item" :is-active="entry.isActive">{{ entry.item.label }}</slot>
					</span>
				</component>
				<span v-if="entry.badge" :id="entry.badgeId" class="base-bottom-nav__sr-only">{{ entry.badge.label }}</span>
			</li>
		</ul>
	</nav>
</template>

<script setup lang="ts">
import '../styles/BaseBottomNav.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseBadge } from '@components/BaseBadge'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseBottomNav } from '../model/useBaseBottomNav'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseBottomNavEmits, BaseBottomNavProps, BaseBottomNavSlots } from '../types/BaseBottomNav.types'

const props = withDefaults(
	defineProps<BaseBottomNavProps>(),
	kitDefaults('BaseBottomNav', {
		variant: DEFAULT_VARIANT,
		modelValue: null,
		isFixed: true,
		hideOnScroll: false,
		maxBadge: 99,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseBottomNavEmits>()
defineSlots<BaseBottomNavSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isHidden,
	handleFocusIn,
	handleFocusOut,
	entries,
	navLabel,
	iconScale,
	badgeScale,
	handleItemClick,
} = useBaseBottomNav(props, emit)
</script>
