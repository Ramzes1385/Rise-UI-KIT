<template>
	<div class="base-pagination" :class="classes.root" :style="[sizeScaleStyle, customColorStyle]">
		<BaseButton
			:variant="props.variant"
			:is-disabled="props.modelValue === 1"
			:size-scale="props.sizeScale"
			:custom-class="classes.prev"
			@click="changePage(props.modelValue - 1)">
			<BaseIcon name="chevron-left" :size-scale="calcIconScale('sm', props.sizeScale)" />
		</BaseButton>

		<div class="base-pagination__pages" :class="classes.pages">
			<template v-for="page in pages" :key="page">
				<BaseButton
					v-if="page !== '...'"
					:variant="props.modelValue === page ? 'default' : props.variant"
					:size-scale="props.sizeScale"
					:custom-class="classes.button"
					@click="changePage(page)">
					<BaseText :size-scale="props.sizeScale">{{ page }}</BaseText>
				</BaseButton>
				<span v-else class="base-pagination__ellipsis" :class="classes.ellipsis">
					<BaseText :size-scale="props.sizeScale">...</BaseText>
				</span>
			</template>
		</div>

		<BaseButton
			:variant="props.variant"
			:is-disabled="props.modelValue === totalPages"
			:size-scale="props.sizeScale"
			:custom-class="classes.next"
			@click="changePage(props.modelValue + 1)">
			<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', props.sizeScale)" />
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
import '../styles/BasePagination.style.scss'
import type { BasePaginationEmits, BasePaginationProps } from '../model/BasePagination.types'

const props = withDefaults(defineProps<BasePaginationProps>(), {
	pageSize: 10,
	maxVisible: 7,
	showLastPage: true,
	variant: 'default',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'prev', 'next', 'pages', 'button', 'ellipsis'],
})

const emit = defineEmits<BasePaginationEmits>()

const totalPages = computed(() => calcTotalPages(props.total, props.pageSize))

const pages = computed(() =>
	calcVisiblePages({
		current: props.modelValue,
		total: totalPages.value,
		maxVisible: props.maxVisible,
		showLastPage: props.showLastPage,
	}),
)

function changePage(page: number): void {
	if (page >= 1 && page <= totalPages.value) {
		emit('update:modelValue', page)
		emit('change', page)
	}
}
</script>
