<template>
	<!--
		Поле с подсказками по образцу APG Combobox (autocomplete list): фокус остаётся в поле, ↓/↑ ведут по вариантам
		(aria-activedescendant), Enter выбирает, Escape закрывает список, а при закрытом — очищает поле
	-->
	<div class="base-autocomplete" :class="classes.root">
		<BaseDropdown
			v-model:is-open="isOpen"
			class="base-autocomplete__dropdown"
			position="bottom-start"
			:match-width="true"
			:padding="0"
			:prevent-mousedown="true"
			:size-scale="sizeScale"
			:custom-class="{ panel: classes.panel }">
			<BaseInput
				ref="inputRef"
				:model-value="query"
				:variant="variant"
				:label="label"
				:placeholder="placeholder"
				:error="error"
				:is-disabled="isControlDisabled"
				:is-readonly="isReadonly"
				:is-required="isRequired"
				:aria-label="ariaLabel"
				:input-attrs="comboboxAttrs"
				:size-scale="sizeScale"
				:color="color"
				:custom-class="{ field: classes.field }"
				@update:model-value="handleInput"
				@keydown="handleKeydown"
				@blur="handleBlur"
				@focus="emit('focus', $event)"
				@click="handleClick" />

			<template #dropdown>
				<div class="base-autocomplete__panel-content">
					<ul
						:id="listboxId"
						class="base-autocomplete__options"
						:class="{ 'base-autocomplete__options--empty': visibleOptions.length === 0 }"
						role="listbox"
						:aria-label="label || ariaLabel || placeholder">
						<li
							v-for="(option, index) in visibleOptions"
							:id="optionId(index)"
							:key="option.value"
							class="base-autocomplete__option"
							:class="[
								{
									'base-autocomplete__option--active': index === activeIndex,
									'base-autocomplete__option--selected': option.value === modelValue,
									'base-autocomplete__option--disabled': option.isDisabled,
								},
								classes.option,
							]"
							role="option"
							:aria-selected="option.value === modelValue ? 'true' : 'false'"
							:aria-disabled="option.isDisabled ? 'true' : undefined"
							@mousemove="activeIndex = index"
							@click="selectOption(option)">
							<slot
								name="option"
								:option="option"
								:is-active="index === activeIndex"
								:is-selected="option.value === modelValue">
								<span class="base-autocomplete__option-label">
									<template v-for="(part, partIndex) in highlight(option.label)" :key="partIndex">
										<mark v-if="part.isMatch" class="base-autocomplete__match">{{ part.text }}</mark>
										<template v-else>{{ part.text }}</template>
									</template>
								</span>
								<span v-if="option.description" class="base-autocomplete__option-description">{{
									option.description
								}}</span>
							</slot>
						</li>
					</ul>
					<div v-if="isLoading" class="base-autocomplete__empty" :class="classes.empty">{{ UI_TEXT.LOADING }}</div>
					<div v-else-if="visibleOptions.length === 0" class="base-autocomplete__empty" :class="classes.empty">
						<slot name="empty">{{ UI_TEXT.NO_RESULTS }}</slot>
					</div>
				</div>
			</template>
		</BaseDropdown>
		<!-- Число вариантов для скринридера: список открылся или изменился по вводу -->
		<span class="base-autocomplete__status" role="status">{{ statusText }}</span>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
import { getLocale, pluralize } from '@/locales/state'
import { kitDefaults } from '@composables/useDefaults'
import { BaseDropdown } from '@components/BaseDropdown'
import { useCustomClass } from '@composables/useCustomClass'
import { useFormDisabled } from '@composables/useFormContext'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import '../styles/BaseAutocomplete.style.scss'
import type {
	AutocompleteOption,
	BaseAutocompleteEmits,
	BaseAutocompleteProps,
	BaseAutocompleteSlots,
} from '../types/BaseAutocomplete.types'

const props = withDefaults(
	defineProps<BaseAutocompleteProps>(),
	kitDefaults('BaseAutocomplete', {
		variant: DEFAULT_VARIANT,
		modelValue: null,
		isDisabled: false,
		isReadonly: false,
		isRequired: false,
		isCustomAllowed: false,
		isRemote: false,
		isLoading: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseAutocompleteEmits>()
defineSlots<BaseAutocompleteSlots>()

/** Классы по элементам (customClass): вид поля, размер и цвет задаёт BaseInput */
const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'panel', 'option', 'empty'] })

const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)
const listboxId = `rise-autocomplete-${useId()}-listbox`

function optionId(index: number): string {
	return `${listboxId}-option-${index}`
}

/** Блокировка: свой isDisabled или неактивная BaseForm вокруг */
const isControlDisabled = useFormDisabled(() => props.isDisabled)

const selectedOption = computed(() => props.options.find(option => option.value === props.modelValue))

/** Текст значения в поле: подпись выбранного варианта или свой вариант */
function valueText(): string {
	if (selectedOption.value) return selectedOption.value.label
	return props.modelValue === null ? '' : String(props.modelValue)
}

const query = ref(valueText())
/** Пользователь печатал после выбора: список фильтруется по запросу */
const isFiltering = ref(false)
const isOpen = ref(false)
const activeIndex = ref(-1)

watch(
	() => [props.modelValue, selectedOption.value?.label],
	() => {
		if (!isFiltering.value) query.value = valueText()
	},
)

function defaultFilter(option: AutocompleteOption, text: string): boolean {
	return option.label.toLocaleLowerCase(getLocale().intl).includes(text.toLocaleLowerCase(getLocale().intl))
}

/** Варианты в списке: с сервера — как есть, иначе — по запросу (после выбора — все), не больше maxResults */
const visibleOptions = computed(() => {
	const text = query.value.trim()
	const filter = props.filter ?? defaultFilter
	const list = props.isRemote || !isFiltering.value || !text ? props.options : props.options.filter(option => filter(option, text))
	return props.maxResults ? list.slice(0, props.maxResults) : list
})

watch(visibleOptions, options => {
	if (activeIndex.value >= options.length) activeIndex.value = -1
})

/** Подпись варианта с выделенным запросом */
function highlight(label: string): { text: string; isMatch: boolean }[] {
	const text = query.value.trim()
	const start = isFiltering.value && text ? label.toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) : -1
	if (start === -1) return [{ text: label, isMatch: false }]
	return [
		{ text: label.slice(0, start), isMatch: false },
		{ text: label.slice(start, start + text.length), isMatch: true },
		{ text: label.slice(start + text.length), isMatch: false },
	].filter(part => part.text)
}

const statusText = computed(() => {
	if (!isOpen.value || !isFiltering.value) return ''
	if (props.isLoading) return UI_TEXT.LOADING
	const count = visibleOptions.value.length
	return count > 0 ? pluralize(getLocale().plural.SEARCH_RESULTS, count) : UI_TEXT.NO_RESULTS
})

const canOpen = computed(() => !isControlDisabled.value && !props.isReadonly)

function open(edge?: 'first' | 'last'): void {
	if (!canOpen.value) return
	isOpen.value = true
	const options = visibleOptions.value
	const selectedIndex = options.findIndex(option => option.value === props.modelValue)
	if (edge === 'first') activeIndex.value = selectedIndex >= 0 ? selectedIndex : firstEnabled(0, 1)
	else if (edge === 'last') activeIndex.value = selectedIndex >= 0 ? selectedIndex : firstEnabled(options.length - 1, -1)
}

function close(): void {
	isOpen.value = false
	activeIndex.value = -1
}

/** Первый доступный вариант от индекса в направлении (с переходом через край) */
function firstEnabled(from: number, direction: 1 | -1): number {
	const options = visibleOptions.value
	for (let offset = 0; offset < options.length; offset++) {
		const index = (from + offset * direction + options.length) % options.length
		if (!options[index].isDisabled) return index
	}
	return -1
}

/** Откуда искать следующий вариант: от активного или, если его нет, с края списка */
function moveOrigin(direction: 1 | -1, count: number): number {
	if (activeIndex.value !== -1) return activeIndex.value + direction
	return direction === 1 ? 0 : count - 1
}

function move(direction: 1 | -1): void {
	const count = visibleOptions.value.length
	if (count === 0) return
	activeIndex.value = firstEnabled(moveOrigin(direction, count), direction)
}

function setValue(value: string | number | null): void {
	if (value === props.modelValue) return
	emit('update:modelValue', value)
	emit('change', value)
}

function selectOption(option: AutocompleteOption): void {
	if (option.isDisabled) return
	isFiltering.value = false
	query.value = option.label
	setValue(option.value)
	close()
}

function handleInput(text: string | number): void {
	query.value = String(text)
	isFiltering.value = true
	activeIndex.value = -1
	emit('search', query.value)
	if (canOpen.value) isOpen.value = true
}

function handleClick(): void {
	if (!isOpen.value) open()
}

/**
 * Итог ввода (выход из поля, Enter без выбора): подпись варианта — выбор, пусто — очистка,
 * свой вариант — значение после normalize, иначе текст возвращается к выбранному значению
 */
function commitQuery(): void {
	if (!isFiltering.value) return
	isFiltering.value = false
	const text = query.value.trim()
	const exact = props.options.find(option => !option.isDisabled && option.label.toLocaleLowerCase() === text.toLocaleLowerCase())
	if (!text) setValue(null)
	else if (exact) setValue(exact.value)
	else if (props.isCustomAllowed) {
		const custom = props.normalize ? props.normalize(text) : text
		if (custom !== null) setValue(custom)
	}
	query.value = valueText()
}

function handleKeydown(event: KeyboardEvent): void {
	if (!canOpen.value) return
	switch (event.key) {
		case 'ArrowDown':
			event.preventDefault()
			if (!isOpen.value) open(event.altKey ? undefined : 'first')
			else if (!event.altKey) move(1)
			break
		case 'ArrowUp':
			event.preventDefault()
			if (event.altKey) close()
			else if (!isOpen.value) open('last')
			else move(-1)
			break
		case 'Enter': {
			const option = isOpen.value ? visibleOptions.value[activeIndex.value] : undefined
			if (option) {
				event.preventDefault()
				selectOption(option)
			} else {
				commitQuery()
				close()
			}
			break
		}
		case 'Escape':
			// Открытый список закрывает поле (preventDefault — стек слоёв не закроет ещё и окно вокруг),
			// закрытый — очищается поле
			if (isOpen.value) {
				event.preventDefault()
				close()
			} else if (query.value) {
				event.preventDefault()
				isFiltering.value = false
				query.value = ''
				setValue(null)
			}
			break
		case 'Tab':
			close()
			break
	}
}

function handleBlur(event: FocusEvent): void {
	commitQuery()
	close()
	emit('blur', event)
}

/** Семантика combobox на нативном поле; атрибуты приложения — первыми */
const comboboxAttrs = computed(() => ({
	...props.inputAttrs,
	role: 'combobox',
	autocomplete: 'off',
	'aria-autocomplete': 'list',
	'aria-expanded': isOpen.value ? 'true' : 'false',
	'aria-controls': isOpen.value ? listboxId : undefined,
	'aria-activedescendant': isOpen.value && activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
}))

defineExpose({
	focus: () => inputRef.value?.focus(),
	blur: () => inputRef.value?.blur(),
	validate: () => inputRef.value?.validate() ?? true,
	reset: () => inputRef.value?.reset(),
})
</script>
