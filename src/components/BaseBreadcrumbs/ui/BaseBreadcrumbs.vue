<template>
	<nav
		class="base-breadcrumbs"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="UI_ARIA.BREADCRUMBS_NAV">
		<component :is="'script'" v-if="structuredData" type="application/ld+json" v-html="structuredData" />

		<ol class="base-breadcrumbs__list" :class="classes.list">
			<li v-if="showHome && items.length" class="base-breadcrumbs__item base-breadcrumbs__item--home" :class="classes.item">
				<slot name="home">
					<component
						:is="getLink(items[0]!).is"
						v-bind="getLink(items[0]!).attrs"
						class="base-breadcrumbs__link base-breadcrumbs__link--home"
						:class="classes.link"
						:aria-label="items[0]?.label"
						@click="handleItemClick(items[0]!)">
						<BaseIcon :name="homeIcon" :size-scale="iconScale" :custom-class="classes.homeIcon" />
					</component>
				</slot>
				<span class="base-breadcrumbs__sep" :class="classes.separator" aria-hidden="true">
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
				<li class="base-breadcrumbs__item base-breadcrumbs__item--ellipsis" :class="classes.item">
					<button
						type="button"
						class="base-breadcrumbs__link base-breadcrumbs__ellipsis-btn"
						:class="[{ 'base-breadcrumbs__ellipsis-btn--expanded': isExpanded }, classes.ellipsisBtn]"
						:aria-label="toggleLabel"
						:aria-expanded="isExpanded"
						@click="toggleExpanded">
						<BaseIcon v-if="isExpanded" name="chevron-left" :size-scale="iconScale" />
						<template v-else>…</template>
					</button>
				</li>
				<li v-if="!isExpanded" class="base-breadcrumbs__item" :class="classes.item" aria-hidden="true">
					<span class="base-breadcrumbs__sep" :class="classes.separator">
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
				:key="`${item?.label ?? ''}-${index}`"
				class="base-breadcrumbs__item"
				:class="[{ 'base-breadcrumbs__item--current': isCurrent(index) }, classes.item]">
				<slot name="item" :item="item" :index="realIndex(index)">
					<component
						:is="getLink(item).is"
						v-if="!isCurrent(index)"
						v-bind="getLink(item).attrs"
						class="base-breadcrumbs__link"
						:class="classes.link"
						@click="handleItemClick(item)">
						<BaseIcon
							v-if="item.icon"
							:name="item.icon"
							:size-scale="iconScale"
							class="base-breadcrumbs__icon"
							:custom-class="classes.itemIcon" />
						<span class="base-breadcrumbs__text" :class="classes.itemText">{{ item.label }}</span>
					</component>
					<span v-else class="base-breadcrumbs__current" :class="classes.current" aria-current="page">
						<BaseIcon
							v-if="item.icon"
							:name="item.icon"
							:size-scale="iconScale"
							class="base-breadcrumbs__icon"
							:custom-class="classes.currentIcon" />
						<span class="base-breadcrumbs__text" :class="classes.currentText">{{ item.label }}</span>
					</span>
				</slot>

				<span v-if="!isCurrent(index)" class="base-breadcrumbs__sep" :class="classes.separator" aria-hidden="true">
					<slot name="separator" :index="realIndex(index)">
						<BreadcrumbsSeparator
							:separator="separator"
							:size-scale="sizeScale"
							:separator-icon-class="classes.separatorIcon"
							:separator-text-class="classes.separatorText" />
					</slot>
				</span>
			</li>
		</ol>
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
