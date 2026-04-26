<template>
	<!-- Режим: модальное окно -->
	<template v-if="mode === 'modal'">
		<BaseButton variant="ghost" class="base-search__modal-trigger" :size-scale="sizeScale" @click="isModalOpen = true">
			<span v-if="hasIcon" class="base-search__icon">🔍</span>
			<BaseText tag="span" class="base-search__modal-trigger-text" :size-scale="sizeScale">{{ placeholder }}</BaseText>
		</BaseButton>
		<Teleport to="body">
			<Transition name="base-search-modal">
				<div v-if="isModalOpen" class="base-search__modal-overlay" :style="sizeScaleStyle" @click.self="closeModal">
					<div class="base-search__modal">
						<div class="base-search__modal-header">
							<BaseInput
								ref="modalInputRef"
								:model-value="query"
								:placeholder="placeholder"
								:variant="variant"
								:size-scale="sizeScale"
								type="text"
								@update:model-value="handleInput"
								@keydown="handleKeydown">
								<template #prefix>
									<span v-if="hasIcon" class="base-search__icon">🔍</span>
								</template>
								<template #suffix>
									<BaseButton
										v-if="hasClear && query"
										variant="ghost"
										class="base-search__clear"
										:size-scale="sizeScale"
										@click="handleClear">
										✕
									</BaseButton>
									<BaseLoader v-if="isLoading" variant="spinner" size="xs" :size-scale="sizeScale" />
								</template>
							</BaseInput>
							<BaseButton variant="ghost" class="base-search__modal-close" :size-scale="sizeScale" @click="closeModal"
								>✕</BaseButton
							>
						</div>
						<div class="base-search__modal-results">
							<template v-if="visibleResults.length > 0">
								<div
									v-for="(item, index) in visibleResults"
									:key="item.id"
									class="base-search__result"
									:class="{ 'base-search__result--highlighted': index === highlightedIndex }"
									@mousedown.prevent="handleSelect(item)"
									@mouseenter="highlightedIndex = index">
									<slot name="result" :item="item" :index="index">
										<span v-if="item.icon" class="base-search__result-icon">{{ item.icon }}</span>
										<div class="base-search__result-content">
											<span class="base-search__result-title">{{ item.title }}</span>
											<span v-if="item.description" class="base-search__result-desc">
												{{ item.description }}
											</span>
										</div>
										<span v-if="item.category" class="base-search__result-category">
											{{ item.category }}
										</span>
									</slot>
								</div>
							</template>
							<template v-else-if="query && !isLoading">
								<slot name="empty">
									<div class="base-search__empty">Ничего не найдено</div>
								</slot>
							</template>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</template>

	<!-- Режим: боковая панель -->
	<template v-else-if="mode === 'sidebar'">
		<BaseButton
			variant="ghost"
			class="base-search__sidebar-trigger"
			:size-scale="sizeScale"
			@click="isSidebarOpen = true">
			<span v-if="hasIcon" class="base-search__icon">🔍</span>
			<BaseText tag="span" class="base-search__sidebar-trigger-text" :size-scale="sizeScale">{{
				placeholder
			}}</BaseText>
		</BaseButton>
		<Teleport to="body">
			<Transition name="base-search-sidebar">
				<div
					v-if="isSidebarOpen"
					class="base-search__sidebar-overlay"
					:style="sizeScaleStyle"
					@click.self="closeSidebar">
					<div class="base-search__sidebar">
						<div class="base-search__sidebar-header">
							<BaseInput
								ref="sidebarInputRef"
								:model-value="query"
								:placeholder="placeholder"
								:variant="variant"
								:size-scale="sizeScale"
								type="text"
								@update:model-value="handleInput"
								@keydown="handleKeydown">
								<template #prefix>
									<span v-if="hasIcon" class="base-search__icon">🔍</span>
								</template>
								<template #suffix>
									<BaseButton
										v-if="hasClear && query"
										variant="ghost"
										class="base-search__clear"
										:size-scale="sizeScale"
										@click="handleClear">
										✕
									</BaseButton>
									<BaseLoader v-if="isLoading" variant="spinner" size="xs" :size-scale="sizeScale" />
								</template>
							</BaseInput>
							<BaseButton
								variant="ghost"
								class="base-search__sidebar-close"
								:size-scale="sizeScale"
								@click="closeSidebar"
								>✕</BaseButton
							>
						</div>
						<div class="base-search__sidebar-results">
							<template v-if="visibleResults.length > 0">
								<div
									v-for="(item, index) in visibleResults"
									:key="item.id"
									class="base-search__result"
									:class="{ 'base-search__result--highlighted': index === highlightedIndex }"
									@mousedown.prevent="handleSelect(item)"
									@mouseenter="highlightedIndex = index">
									<slot name="result" :item="item" :index="index">
										<span v-if="item.icon" class="base-search__result-icon">{{ item.icon }}</span>
										<div class="base-search__result-content">
											<span class="base-search__result-title">{{ item.title }}</span>
											<span v-if="item.description" class="base-search__result-desc">
												{{ item.description }}
											</span>
										</div>
										<span v-if="item.category" class="base-search__result-category">
											{{ item.category }}
										</span>
									</slot>
								</div>
							</template>
							<template v-else-if="query && !isLoading">
								<slot name="empty">
									<div class="base-search__empty">Ничего не найдено</div>
								</slot>
							</template>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</template>

	<!-- Режим: по умолчанию (inline dropdown) -->
	<BaseDropdown
		v-else
		:style="sizeScaleStyle"
		:is-open="isOpen"
		position="bottom-start"
		:match-width="true"
		:prevent-mousedown="false"
		:size-scale="sizeScale"
		max-height="320px"
		@close="handleClose">
		<BaseInput
			ref="baseInputRef"
			:model-value="query"
			:placeholder="placeholder"
			:variant="variant"
			:size-scale="sizeScale"
			:is-disabled="isDisabled"
			type="text"
			@update:model-value="handleInput"
			@focus="handleFocus"
			@blur="handleBlur"
			@keydown="handleKeydown">
			<template #prefix>
				<span v-if="hasIcon" class="base-search__icon">🔍</span>
			</template>
			<template #suffix>
				<BaseButton
					v-if="hasClear && query"
					variant="ghost"
					class="base-search__clear"
					:size-scale="sizeScale"
					@click="handleClear"
					>✕</BaseButton
				>
				<BaseLoader v-if="isLoading" variant="spinner" size="xs" :size-scale="sizeScale" />
			</template>
		</BaseInput>

		<template #dropdown>
			<!-- Результаты поиска -->
			<template v-if="visibleResults.length > 0">
				<div
					v-for="(item, index) in visibleResults"
					:key="item.id"
					class="base-search__result"
					:class="{ 'base-search__result--highlighted': index === highlightedIndex }"
					@mousedown.prevent="handleSelect(item)"
					@mouseenter="highlightedIndex = index">
					<slot name="result" :item="item" :index="index">
						<span v-if="item.icon" class="base-search__result-icon">{{ item.icon }}</span>
						<div class="base-search__result-content">
							<span class="base-search__result-title">{{ item.title }}</span>
							<span v-if="item.description" class="base-search__result-desc">
								{{ item.description }}
							</span>
						</div>
						<span v-if="item.category" class="base-search__result-category">
							{{ item.category }}
						</span>
					</slot>
				</div>
			</template>

			<!-- Пустой результат -->
			<template v-else-if="query && !isLoading">
				<slot name="empty">
					<div class="base-search__empty">Ничего не найдено</div>
				</slot>
			</template>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@/shared/composables/useDebounce'
import { useListNavigation } from '@/shared/composables/useListNavigation'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseDropdown } from '@/shared/ui/BaseDropdown'
import { BaseInput } from '@/shared/ui/BaseInput'
import { BaseLoader } from '@/shared/ui/BaseLoader'
import { BaseText } from '@/shared/ui/BaseText'
import { computed, nextTick, ref, watch } from 'vue'
import './BaseSearch.style.scss'
import type { BaseSearchEmits, BaseSearchProps, SearchResult } from './BaseSearch.types'

const props = withDefaults(defineProps<BaseSearchProps>(), {
	modelValue: '',
	placeholder: 'Поиск...',
	sizeScale: 100,
	variant: 'outline',
	mode: 'default',
	results: () => [],
	isInstant: true,
	debounceMs: 300,
	isLoading: false,
	hasClear: true,
	hasIcon: true,
	maxResults: 10,
	isAutofocus: false,
	isDisabled: false,
})

const emit = defineEmits<BaseSearchEmits>()

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })

const baseInputRef = ref<InstanceType<typeof BaseInput> | null>(null)
const modalInputRef = ref<InstanceType<typeof BaseInput> | null>(null)
const sidebarInputRef = ref<InstanceType<typeof BaseInput> | null>(null)
const query = ref(props.modelValue)
const isFocused = ref(false)
const isModalOpen = ref(false)
const isSidebarOpen = ref(false)

/** Видимые результаты */
const visibleResults = computed((): SearchResult[] => {
	return props.results.slice(0, props.maxResults)
})

/** Открыт ли выпадающий список (default mode) */
const isOpen = computed((): boolean => {
	return isFocused.value && query.value.length > 0
})

/** Дебаунс поиска */
const debouncedSearch = useDebounceFn((value: string) => {
	if (value) emit('search', value)
}, props.debounceMs)

/** Навигация по результатам клавишами */
const {
	highlightedIndex,
	handleKeydown: handleListKeydown,
	reset: resetHighlight,
} = useListNavigation({
	itemCount: () => visibleResults.value.length,
	onSelect: index => handleSelect(visibleResults.value[index]),
	onEscape: () => {
		if (props.mode === 'modal') closeModal()
		else if (props.mode === 'sidebar') closeSidebar()
	},
})

/** Обработка ввода */
function handleInput(value: string): void {
	query.value = value
	emit('update:modelValue', value)
	if (props.isInstant) {
		debouncedSearch(value)
	}
}

/** Обработка фокуса */
function handleFocus(): void {
	isFocused.value = true
}

/** Обработка потери фокуса */
function handleBlur(): void {
	isFocused.value = false
	resetHighlight()
}

/** Обработка клавиш */
function handleKeydown(e: KeyboardEvent): void {
	if (e.key === 'Enter' && highlightedIndex.value < 0 && query.value) {
		e.preventDefault()
		emit('search', query.value)
		return
	}
	handleListKeydown(e)
}

/** Очистить поле */
function handleClear(): void {
	query.value = ''
	emit('update:modelValue', '')
	emit('clear')
	focusActiveInput()
}

/** Выбрать результат */
function handleSelect(item: SearchResult): void {
	query.value = item.title
	emit('select', item)
	emit('update:modelValue', item.title)
	isFocused.value = false
	if (props.mode === 'modal') closeModal()
	else if (props.mode === 'sidebar') closeSidebar()
}

/** Закрыть dropdown */
function handleClose(): void {
	isFocused.value = false
	resetHighlight()
}

/** Открыть модальное окно */
function openModal(): void {
	isModalOpen.value = true
	nextTick(() => {
		modalInputRef.value?.focus()
	})
}

/** Закрыть модальное окно */
function closeModal(): void {
	isModalOpen.value = false
	resetHighlight()
}

/** Открыть боковую панель */
function openSidebar(): void {
	isSidebarOpen.value = true
	nextTick(() => {
		sidebarInputRef.value?.focus()
	})
}

/** Закрыть боковую панель */
function closeSidebar(): void {
	isSidebarOpen.value = false
	resetHighlight()
}

/** Фокус на активный инпут */
function focusActiveInput(): void {
	if (props.mode === 'modal') modalInputRef.value?.focus()
	else if (props.mode === 'sidebar') sidebarInputRef.value?.focus()
	else baseInputRef.value?.focus()
}

watch(
	() => props.modelValue,
	val => {
		if (val !== query.value) query.value = val
	},
)
</script>
