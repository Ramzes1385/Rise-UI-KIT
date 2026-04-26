<template>
	<div class="base-pagination" :class="[variantClass]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseButton
			variant="outline"
			:is-disabled="modelValue === 1"
			:size-scale="sizeScale"
			@click="changePage(modelValue - 1)">
			<template v-if="(variant as string) === 'arrows'">
				<BaseIcon name="chevron-left" size="sm" :size-scale="sizeScale" />
			</template>
			<template v-else>
				<BaseText :size-scale="sizeScale">Назад</BaseText>
			</template>
		</BaseButton>

		<div class="base-pagination__pages">
			<BaseButton
				v-for="page in pages"
				:key="page"
				:variant="modelValue === page ? 'default' : 'outline'"
				:size-scale="sizeScale"
				@click="changePage(page)">
				<BaseText :size-scale="sizeScale">{{ page }}</BaseText>
			</BaseButton>
		</div>

		<BaseButton
			variant="outline"
			:is-disabled="modelValue === totalPages"
			:size-scale="sizeScale"
			@click="changePage(modelValue + 1)">
			<template v-if="(variant as string) === 'arrows'">
				<BaseIcon name="chevron-right" size="sm" :size-scale="sizeScale" />
			</template>
			<template v-else>
				<BaseText :size-scale="sizeScale">Вперед</BaseText>
			</template>
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { calcTotalPages, calcVisiblePages } from '@/shared/utils/paginationUtils'
import { computed } from 'vue'
import './BasePagination.style.scss'
import type { BasePaginationEmits, BasePaginationProps } from './BasePagination.types'

const props = withDefaults(defineProps<BasePaginationProps>(), {
	pageSize: 10,
	maxVisible: 5,
	variant: 'default',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-pagination', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BasePaginationEmits>()

const totalPages = computed(() => calcTotalPages(props.total, props.pageSize))

const pages = computed(() =>
	calcVisiblePages({
		current: props.modelValue,
		total: totalPages.value,
		maxVisible: props.maxVisible,
	}),
)

function changePage(page: number): void {
	if (page >= 1 && page <= totalPages.value) {
		emit('update:modelValue', page)
		emit('change', page)
	}
}
</script>
