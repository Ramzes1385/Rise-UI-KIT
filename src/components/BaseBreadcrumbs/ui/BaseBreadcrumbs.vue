<template>
	<nav
		ref="rootRef"
		:class="[ui('root'), variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="UI_ARIA.BREADCRUMBS_NAV">
		<component :is="'script'" v-if="structuredData" type="application/ld+json" v-html="structuredData" />

		<TransitionGroup tag="ol" :name="revealName" :css="isRevealAnimated" :class="[ui('list'), classes.list]" @leave="leaveAtOnce">
			<li v-if="showHome && items.length" key="home" :class="[ui('item'), 'base-breadcrumbs__item--home', classes.item]">
				<slot name="home">
					<component
						:is="getLink(items[0]!).is"
						v-bind="getLink(items[0]!).attrs"
						:class="[ui('link'), 'base-breadcrumbs__link--home', classes.link]"
						:aria-label="items[0]?.label"
						@click="handleItemClick(items[0]!)">
						<BaseIcon :name="homeIcon" :size-scale="iconScale" :custom-class="classes.homeIcon" />
					</component>
				</slot>
				<span :class="[ui('sep'), classes.separator]" aria-hidden="true">
					<slot name="separator" :index="-1">
						<BreadcrumbsSeparator
							:separator="separator"
							:size-scale="sizeScale"
							:separator-icon-class="classes.separatorIcon"
							:separator-text-class="classes.separatorText" />
					</slot>
				</span>
			</li>

			<template v-if="canCollapse">
				<li key="ellipsis" :class="[ui('item'), 'base-breadcrumbs__item--ellipsis', classes.item]">
					<button
						type="button"
						:class="[
							ui('link'),
							ui('ellipsis-btn'),
							{ 'base-breadcrumbs__ellipsis-btn--expanded': isExpanded },
							classes.ellipsisBtn,
						]"
						:aria-label="toggleLabel"
						:aria-expanded="isExpanded"
						@click="toggleExpanded">
						<BaseIcon v-if="isExpanded" name="chevron-left" :size-scale="iconScale" />
						<template v-else>…</template>
					</button>
				</li>
				<li v-if="!isExpanded" key="ellipsis-sep" :class="[ui('item'), classes.item]" aria-hidden="true">
					<span :class="[ui('sep'), classes.separator]">
						<slot name="separator" :index="0">
							<BreadcrumbsSeparator
								:separator="separator"
								:size-scale="sizeScale"
								:separator-icon-class="classes.separatorIcon"
								:separator-text-class="classes.separatorText" />
						</slot>
					</span>
				</li>
			</template>

			<li
				v-for="(item, index) in visibleItems"
				:key="`${realIndex(index)}-${item?.label ?? ''}`"
				:class="[ui('item'), { 'base-breadcrumbs__item--current': isCurrent(index) }, classes.item]">
				<slot name="item" :item="item" :index="realIndex(index)">
					<component
						:is="getLink(item).is"
						v-if="!isCurrent(index)"
						v-bind="getLink(item).attrs"
						:class="[ui('link'), classes.link]"
						@click="handleItemClick(item)">
						<BaseIcon
							v-if="item.icon"
							:name="item.icon"
							:size-scale="iconScale"
							:class="ui('icon')"
							:custom-class="classes.itemIcon" />
						<span :class="[ui('text'), classes.itemText]">{{ item.label }}</span>
					</component>
					<span v-else :class="[ui('current'), classes.current]" aria-current="page">
						<BaseIcon
							v-if="item.icon"
							:name="item.icon"
							:size-scale="iconScale"
							:class="ui('icon')"
							:custom-class="classes.currentIcon" />
						<span :class="[ui('text'), classes.currentText]">{{ item.label }}</span>
					</span>
				</slot>

				<span v-if="!isCurrent(index)" :class="[ui('sep'), classes.separator]" aria-hidden="true">
					<slot name="separator" :index="realIndex(index)">
						<BreadcrumbsSeparator
							:separator="separator"
							:size-scale="sizeScale"
							:separator-icon-class="classes.separatorIcon"
							:separator-text-class="classes.separatorText" />
					</slot>
				</span>
			</li>
		</TransitionGroup>
	</nav>
</template>

<script setup lang="ts">
import '@components/BaseLink/styles/BaseLink.style.scss'
import '../styles/BaseBreadcrumbs.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { kitDefaults } from '@composables/base/useDefaults'
import BreadcrumbsSeparator from './BreadcrumbsSeparator.vue'
import { useBaseBreadcrumbs } from '../model/useBaseBreadcrumbs'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseBreadcrumbsEmits, BaseBreadcrumbsProps, BaseBreadcrumbsSlots } from '../types/BaseBreadcrumbs.types'

const props = withDefaults(
	defineProps<BaseBreadcrumbsProps>(),
	kitDefaults('BaseBreadcrumbs', {
		variant: DEFAULT_VARIANT,
		separator: 'chevron',
		maxItems: 0,
		showHome: false,
		seo: false,
		homeIcon: 'home',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseBreadcrumbsEmits>()
defineSlots<BaseBreadcrumbsSlots>()

const {
	ui,
	rootRef,
	revealName,
	isRevealAnimated,
	leaveAtOnce,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isExpanded,
	canCollapse,
	toggleLabel,
	toggleExpanded,
	visibleItems,
	iconScale,
	structuredData,
	isCurrent,
	realIndex,
	getLink,
	handleItemClick,
} = useBaseBreadcrumbs(props, emit)
</script>
