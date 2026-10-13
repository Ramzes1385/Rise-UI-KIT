<template>
	<nav
		:class="[
			ui('root'),
			variantClass,
			{
				'base-bottom-nav--fixed': isFixed,
				'base-bottom-nav--hidden': isHidden,
				'base-bottom-nav--indicator-ready': isIndicatorVisible,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="navLabel"
		@focusin="handleFocusIn"
		@focusout="handleFocusOut">
		<div
			ref="barRef"
			:class="[ui('bar'), { 'base-bottom-nav__bar--notched': notchStyle }, classes.bar]"
			:style="[notchStyle, indicatorStyle]">
			<span
				v-if="isIndicatorVisible"
				:class="[ui('indicator'), { 'base-bottom-nav__indicator--instant': isIndicatorInstant }]"
				aria-hidden="true" />
			<ul :class="[ui('list'), classes.list]">
				<li
					v-for="entry in entries"
					:key="entry.item.value"
					:class="[ui('item'), classes.item]"
					:data-indicator-item="isCellIndicator ? '' : undefined">
					<component
						:is="entry.link.is"
						v-bind="entry.link.attrs"
						:class="[
							ui('link'),
							{
								'base-bottom-nav__link--active': entry.isActive,
								'base-bottom-nav__link--disabled': entry.item.isDisabled,
								'base-bottom-nav__link--primary': entry.isPrimary,
							},
							classes.link,
						]"
						:aria-current="entry.isActive ? 'page' : undefined"
						:aria-describedby="entry.badge ? entry.badgeId : undefined"
						@click="handleItemClick(entry, $event)">
						<span :class="ui('icon-wrap')" :data-indicator-item="isCellIndicator ? undefined : ''">
							<slot name="icon" :item="entry.item" :is-active="entry.isActive">
								<BaseIcon :name="entry.icon" :size-scale="iconScale" :class="ui('icon')" :custom-class="classes.icon" />
							</slot>
							<BaseBadge
								v-if="entry.badge"
								:class="ui('badge')"
								:custom-class="classes.badge"
								:label="entry.badge.text"
								:size-scale="badgeScale"
								aria-hidden="true" />
						</span>
						<span :class="[ui('label'), classes.label]">
							<slot name="label" :item="entry.item" :is-active="entry.isActive">{{ entry.item.label }}</slot>
						</span>
					</component>
					<span v-if="entry.badge" :id="entry.badgeId" class="base-bottom-nav__sr-only">{{ entry.badge.label }}</span>
				</li>
			</ul>
		</div>
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
	ui,
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
	barRef,
	isCellIndicator,
	indicatorStyle,
	isIndicatorVisible,
	isIndicatorInstant,
	notchStyle,
} = useBaseBottomNav(props, emit)
</script>
