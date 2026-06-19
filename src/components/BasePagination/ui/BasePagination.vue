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
import { computed } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { SIZE_SCALE_DEFAULT, DEFAULT_VARIANT } from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BasePagination.style.scss'
import { calcTotalPages, calcVisiblePages } from '@utils/paginationUtils'
import type { BasePaginationEmits, BasePaginationProps, BasePaginationSlots } from '../model/BasePagination.types'

const props = withDefaults(defineProps<BasePaginationProps>(), {
	pageSize: 10,
	maxVisible: 7,
	showLastPage: true,
	variant: DEFAULT_VARIANT,
	sizeScale: SIZE_SCALE_DEFAULT,
})

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

function changePage(page: number): void {
	if (page >= 1 && page <= totalPages.value) {
		emit('update:modelValue', page)
		emit('change', page)
	}
}
</script>
