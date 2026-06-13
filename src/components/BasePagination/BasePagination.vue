<template>
	<div class="base-pagination" :class="classes.root" :style="[sizeScaleStyle, customColorStyle]">
		<BaseButton
			:variant="variant"
			:is-disabled="modelValue === 1"
			:size-scale="sizeScale"
			:custom-class="classes.prev"
			@click="changePage(modelValue - 1)">
			<BaseIcon name="chevron-left" :size-scale="calcIconScale('sm', sizeScale)" />
		</BaseButton>

		<div class="base-pagination__pages" :class="classes.pages">
			<template v-for="page in pages" :key="page">
				<BaseButton
					v-if="page !== '...'"
					:variant="modelValue === page ? 'default' : variant"
					:size-scale="sizeScale"
					:custom-class="classes.button"
					@click="changePage(page)">
					<BaseText :size-scale="sizeScale">{{ page }}</BaseText>
				</BaseButton>
				<span v-else class="base-pagination__ellipsis" :class="classes.ellipsis">
					<BaseText :size-scale="sizeScale">...</BaseText>
				</span>
			</template>
		</div>

		<BaseButton
			:variant="variant"
			:is-disabled="modelValue === totalPages"
			:size-scale="sizeScale"
			:custom-class="classes.next"
			@click="changePage(modelValue + 1)">
			<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', sizeScale)" />
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { calcTotalPages, calcVisiblePages } from '@utils/paginationUtils'
import { computed } from 'vue'
import type { PropType } from 'vue'
import './BasePagination.style.scss'
import type { BasePaginationEmits, BasePaginationProps } from './BasePagination.types'

const props = defineProps({
	modelValue: { type: Number, required: true },
	total: { type: Number, required: true },
	pageSize: { type: Number, default: 10 },
	maxVisible: { type: Number, default: 7 },
	showLastPage: { type: Boolean, default: true },
	variant: { type: String as PropType<BasePaginationProps['variant']>, default: 'default' },
	color: Object as PropType<BasePaginationProps['color']>,
	sizeScale: { type: Number, default: 100 },
	customClass: [String, Object] as PropType<BasePaginationProps['customClass']>,
})

const pageSize = computed(() => props.pageSize ?? 10)
const maxVisible = computed(() => props.maxVisible ?? 7)
const showLastPage = computed(() => props.showLastPage)
const variant = computed(() => props.variant ?? 'default')
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'prev', 'next', 'pages', 'button', 'ellipsis'],
})

const emit = defineEmits<BasePaginationEmits>()

const totalPages = computed(() => calcTotalPages(props.total, pageSize.value))

const pages = computed(() =>
	calcVisiblePages({
		current: props.modelValue,
		total: totalPages.value,
		maxVisible: maxVisible.value,
		showLastPage: showLastPage.value,
	}),
)

function changePage(page: number): void {
	if (page >= 1 && page <= totalPages.value) {
		emit('update:modelValue', page)
		emit('change', page)
	}
}
</script>
