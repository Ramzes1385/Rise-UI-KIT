<template>
	<nav
		v-if="links.length"
		class="base-anchor"
		:class="[variantClass, `base-anchor--${direction}`, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="label ?? UI_ARIA.ANCHOR_NAV">
		<ol class="base-anchor__list" :class="classes.list">
			<li
				v-for="link in links"
				:key="link.id"
				class="base-anchor__item"
				:class="classes.item"
				:style="{ '--anchor-level': link.level }">
				<a
					:href="`#${link.id}`"
					class="base-anchor__link"
					:class="[{ 'base-anchor__link--active': isActive(link) }, classes.link]"
					:aria-current="isActive(link) ? 'location' : undefined"
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

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, links, isActive, handleClick, refresh, scrollTo } =
	useBaseAnchor(props, emit)

defineExpose({ refresh, scrollTo })
</script>
