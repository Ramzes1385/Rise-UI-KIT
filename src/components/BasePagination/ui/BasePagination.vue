<template>
	<div class="base-pagination" :class="classes.root" :style="[sizeScaleStyle, customColorStyle]">
		<BaseButton
			:variant="inactivePageVariant"
			class="base-pagination__arrow"
			:is-disabled="isPrevDisabled"
			:size-scale="sizeScale"
			:custom-class="classes.prev"
			:aria-label="UI_ARIA.PAGINATION_PREV"
			@click="goToPrevPage">
			<BaseIcon name="chevron-left" :size-scale="calcIconScale('md', sizeScale)" />
		</BaseButton>

		<div class="base-pagination__pages" :class="classes.pages">
			<template v-for="(page, index) in pages" :key="page === '...' ? `ellipsis-${index}` : page">
				<BaseButton
					v-if="page !== '...'"
					:variant="modelValue === page ? DEFAULT_VARIANT : inactivePageVariant"
					class="base-pagination__page"
					:class="{ 'base-pagination__page--current': modelValue === page }"
					:aria-current="modelValue === page ? 'page' : undefined"
					:size-scale="sizeScale"
					:custom-class="classes.button"
					@click="changePage(page)">
					{{ page }}
				</BaseButton>
				<span v-else class="base-pagination__ellipsis" :class="classes.ellipsis">…</span>
			</template>
		</div>

		<BaseButton
			:variant="inactivePageVariant"
			class="base-pagination__arrow"
			:is-disabled="isNextDisabled"
			:size-scale="sizeScale"
			:custom-class="classes.next"
			:aria-label="UI_ARIA.PAGINATION_NEXT"
			@click="changePage(modelValue + 1)">
			<BaseIcon name="chevron-right" :size-scale="calcIconScale('md', sizeScale)" />
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { kitDefaults } from '@composables/useDefaults'
import { useSizeScale } from '@composables/useSizeScale'
import { SIZE_SCALE_DEFAULT, DEFAULT_VARIANT, UI_ARIA } from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BasePagination.style.scss'
import { calcTotalPages, calcVisiblePages } from '@utils/paginationUtils'
import type { BasePaginationEmits, BasePaginationProps, BasePaginationSlots } from '../model/BasePagination.types'

const props = withDefaults(defineProps<BasePaginationProps>(), kitDefaults('BasePagination', {
	pageSize: 10,
	maxVisible: 7,
	showLastPage: true,
	variant: DEFAULT_VARIANT,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'prev', 'next', 'pages', 'button', 'ellipsis'],
})

const emit = defineEmits<BasePaginationEmits>()

defineSlots<BasePaginationSlots>()

const totalPages = computed(() => calcTotalPages(props.total, props.pageSize))

const pages = computed(() =>
	calcVisiblePages({
		current: props.modelValue,
		total: totalPages.value,
		maxVisible: props.maxVisible,
		showLastPage: props.showLastPage,
	}),
)

/**
 * Вариант стрелок и неактивных страниц. Текущая страница всегда рисуется вариантом по умолчанию (заливка основным
 * цветом), поэтому при variant='default' остальным нужен нейтральный ghost — иначе текущую страницу не отличить.
 */
const inactivePageVariant = computed(() => (props.variant === DEFAULT_VARIANT ? 'ghost' : props.variant))

/**
 * Границы сравниваются через <=/>=, а не ===: modelValue может оказаться вне диапазона
 * (total уменьшился после фильтрации или ещё равен 0 до загрузки), и тогда кнопки не должны выглядеть активными.
 */
const isPrevDisabled = computed(() => props.modelValue <= 1 || totalPages.value < 1)
const isNextDisabled = computed(() => props.modelValue >= totalPages.value)

function changePage(page: number): void {
	if (page >= 1 && page <= totalPages.value) {
		emit('update:modelValue', page)
		emit('change', page)
	}
}

/** Со страницы за пределами диапазона «назад» ведёт на последнюю существующую, иначе changePage отбросил бы modelValue - 1 */
function goToPrevPage(): void {
	changePage(Math.min(props.modelValue - 1, totalPages.value))
}
</script>
