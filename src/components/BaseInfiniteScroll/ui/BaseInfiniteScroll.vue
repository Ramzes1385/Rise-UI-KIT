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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import '../styles/BaseInfiniteScroll.style.scss'
import type {
	BaseInfiniteScrollEmits,
	BaseInfiniteScrollExpose,
	BaseInfiniteScrollProps,
	BaseInfiniteScrollSlots,
	InfiniteScrollResult,
	InfiniteScrollStatus,
} from '../model/BaseInfiniteScroll.types'

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

const { sizeScaleStyle, variantClass, variantStyle, classes } = useStandardBaseComponent('base-infinite-scroll', props, ['root', 'status'])

const status = ref<InfiniteScrollStatus>('idle')
const sentinelRef = ref<HTMLElement | null>(null)

const message = computed(() => {
	switch (status.value) {
		case 'loading':
			return props.loadingText ?? UI_TEXT.LOADING
		case 'empty':
			return props.emptyText ?? UI_TEXT.NO_MORE_ITEMS
		case 'error':
			return props.errorText ?? UI_TEXT.LOAD_ERROR
		default:
			return ''
	}
})

/** Ждём конца списка в режиме intersect: строке состояния нечего показать, она не занимает места */
const isFooterEmpty = computed(() => status.value === 'idle' && props.mode === 'intersect')

let observer: IntersectionObserver | null = null

/**
 * Следить за концом списка. Наблюдатель создаётся заново и после каждой успешной подгрузки: он сразу сообщает, видна ли
 * метка, — если новых строк не хватило, чтобы заполнить область, подгрузка продолжится
 */
function observe(): void {
	observer?.disconnect()
	observer = null
	if (props.mode !== 'intersect' || !sentinelRef.value || typeof IntersectionObserver === 'undefined') return
	const root = typeof props.root === 'string' ? document.querySelector(props.root) : (props.root ?? null)
	observer = new IntersectionObserver(
		entries => {
			if (status.value === 'idle' && entries.some(entry => entry.isIntersecting)) load()
		},
		{ root, rootMargin: `0px 0px ${props.distance}px 0px` },
	)
	observer.observe(sentinelRef.value)
}

function load(): void {
	if (status.value === 'loading' || status.value === 'empty') return
	status.value = 'loading'
	let isDone = false
	emit('load', {
		done: (result: InfiniteScrollResult) => {
			if (isDone) return
			isDone = true
			status.value = result === 'ok' ? 'idle' : result
			if (result === 'ok') void nextTick(observe)
		},
	})
}

function reset(): void {
	status.value = 'idle'
	void nextTick(observe)
}

onMounted(observe)
watch(() => [props.mode, props.root, props.distance], observe)
onBeforeUnmount(() => observer?.disconnect())

defineExpose<BaseInfiniteScrollExpose>({ reset, load })
</script>
