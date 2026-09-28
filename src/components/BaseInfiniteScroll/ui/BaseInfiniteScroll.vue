<template>
	<!--
		Бесконечная прокрутка: когда конец списка подходит к краю области, приходит событие load, а done сообщает итог.
		Пока идёт загрузка, у списка aria-busy; загрузку, конец списка и ошибку объявляет строка состояния (role="status").
		После ошибки — кнопка «Повторить», в режиме manual — кнопка «Загрузить еще» (удобно с клавиатуры: до подвала можно дойти)
	-->
	<div
		class="base-infinite-scroll"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle]"
		:aria-busy="status === 'loading' ? 'true' : undefined">
		<slot />
		<div ref="sentinelRef" class="base-infinite-scroll__sentinel" aria-hidden="true" />
		<div class="base-infinite-scroll__footer" :class="[{ 'base-infinite-scroll__footer--empty': isFooterEmpty }, classes.status]">
			<BaseLoader v-if="status === 'loading'" class="base-infinite-scroll__loader" :size-scale="sizeScale" aria-hidden="true" />
			<span class="base-infinite-scroll__message" role="status">{{ message }}</span>
			<BaseButton v-if="status === 'error'" variant="soft" :size-scale="sizeScale" @click="load">{{ UI_TEXT.RETRY }}</BaseButton>
			<BaseButton v-else-if="status === 'idle' && mode === 'manual'" variant="soft" :size-scale="sizeScale" @click="load">
				{{ loadMoreText ?? UI_TEXT.LOAD_MORE }}
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { UI_TEXT } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseInfiniteScroll } from '../model/useBaseInfiniteScroll'
import '../styles/BaseInfiniteScroll.style.scss'
import type {
	BaseInfiniteScrollEmits,
	BaseInfiniteScrollExpose,
	BaseInfiniteScrollProps,
	BaseInfiniteScrollSlots,
} from '../types/BaseInfiniteScroll.types'

const props = withDefaults(
	defineProps<BaseInfiniteScrollProps>(),
	kitDefaults('BaseInfiniteScroll', {
		variant: DEFAULT_VARIANT,
		mode: 'intersect',
		distance: 200,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseInfiniteScrollEmits>()
defineSlots<BaseInfiniteScrollSlots>()

const { sizeScaleStyle, variantClass, variantStyle, classes, status, sentinelRef, message, isFooterEmpty, load, exposed } =
	useBaseInfiniteScroll(props, emit)

defineExpose<BaseInfiniteScrollExpose>(exposed)
</script>
