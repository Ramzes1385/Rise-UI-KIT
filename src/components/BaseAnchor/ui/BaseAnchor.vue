<template>
	<nav
		v-if="links.length"
		ref="rootRef"
		:class="[
			ui('root'),
			variantClass,
			`base-anchor--${direction}`,
			{ 'base-anchor--indicator-ready': isIndicatorVisible },
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, indicatorStyle]"
		:aria-label="label ?? UI_ARIA.ANCHOR_NAV">
		<span
			v-if="isIndicatorVisible"
			:class="[ui('indicator'), { 'base-anchor__indicator--instant': isIndicatorInstant }]"
			aria-hidden="true" />
		<ol :class="[ui('list'), classes.list]">
			<li v-for="link in links" :key="link.id" :class="[ui('item'), classes.item]" :style="{ '--anchor-level': link.level }">
				<a
					:href="`#${link.id}`"
					:class="[ui('link'), { 'base-anchor__link--active': isActive(link) }, classes.link]"
					:aria-current="isActive(link) ? 'location' : undefined"
					data-indicator-item
					@click="handleClick(link, $event)">
					<slot name="item" :item="link" :is-active="isActive(link)">{{ link.label }}</slot>
				</a>
			</li>
		</ol>
	</nav>
</template>

<script setup lang="ts">
import '../styles/BaseAnchor.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { useBaseAnchor } from '../model/useBaseAnchor'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseAnchorEmits, BaseAnchorProps, BaseAnchorSlots } from '../types/BaseAnchor.types'

const props = withDefaults(
	defineProps<BaseAnchorProps>(),
	kitDefaults('BaseAnchor', {
		variant: DEFAULT_VARIANT,
		headings: 'h2, h3',
		offset: 0,
		direction: 'vertical',
		isHashSynced: true,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseAnchorEmits>()

defineSlots<BaseAnchorSlots>()

const {
	ui,
	rootRef,
	indicatorStyle,
	isIndicatorVisible,
	isIndicatorInstant,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	links,
	isActive,
	handleClick,
	refresh,
	scrollTo,
} = useBaseAnchor(props, emit)

defineExpose({ refresh, scrollTo })
</script>
