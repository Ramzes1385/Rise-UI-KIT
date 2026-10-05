<template>
	<nav :class="[ui('root'), classes.root]" :style="[sizeScaleStyle, customColorStyle]" :aria-label="navLabel">
		<BaseButton
			:variant="inactivePageVariant"
			:class="ui('arrow')"
			:is-disabled="isPrevDisabled"
			is-focusable-when-disabled
			:size-scale="sizeScale"
			:custom-class="classes.prev"
			:aria-label="UI_ARIA.PAGINATION_PREV"
			@click="goToPrevPage">
			<BaseIcon name="chevron-left" :size-scale="calcIconScale('md', sizeScale)" />
		</BaseButton>

		<div ref="pagesRef" :class="[ui('pages'), classes.pages]" :style="indicatorStyle">
			<span
				v-if="isIndicatorVisible"
				:class="[ui('indicator'), { 'base-pagination__indicator--instant': isIndicatorInstant }]"
				aria-hidden="true" />
			<template v-for="(page, index) in pages" :key="page === '...' ? `ellipsis-${index}` : page">
				<BaseButton
					v-if="page !== '...'"
					:variant="modelValue === page ? DEFAULT_VARIANT : inactivePageVariant"
					:class="[ui('page'), { 'base-pagination__page--current': modelValue === page }]"
					data-indicator-item
					:aria-current="modelValue === page ? 'page' : undefined"
					:aria-label="pageLabel(page)"
					:size-scale="sizeScale"
					:custom-class="classes.button"
					@click="changePage(page)">
					{{ page }}
				</BaseButton>
				<span v-else :class="[ui('ellipsis'), classes.ellipsis]">…</span>
			</template>
		</div>

		<BaseButton
			:variant="inactivePageVariant"
			:class="ui('arrow')"
			:is-disabled="isNextDisabled"
			is-focusable-when-disabled
			:size-scale="sizeScale"
			:custom-class="classes.next"
			:aria-label="UI_ARIA.PAGINATION_NEXT"
			@click="changePage(modelValue + 1)">
			<BaseIcon name="chevron-right" :size-scale="calcIconScale('md', sizeScale)" />
		</BaseButton>
	</nav>
</template>

<script setup lang="ts">
import '../styles/BasePagination.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { calcIconScale } from '@utils/media/iconUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBasePagination } from '../model/useBasePagination'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BasePaginationEmits, BasePaginationProps, BasePaginationSlots } from '../types/BasePagination.types'

const props = withDefaults(
	defineProps<BasePaginationProps>(),
	kitDefaults('BasePagination', {
		pageSize: 10,
		maxVisible: 7,
		showLastPage: true,
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BasePaginationEmits>()

defineSlots<BasePaginationSlots>()

const {
	ui,
	pagesRef,
	indicatorStyle,
	isIndicatorVisible,
	isIndicatorInstant,
	sizeScaleStyle,
	customColorStyle,
	classes,
	pages,
	inactivePageVariant,
	isPrevDisabled,
	isNextDisabled,
	navLabel,
	pageLabel,
	changePage,
	goToPrevPage,
} = useBasePagination(props, emit)
</script>
