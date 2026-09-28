import type { ComputedRef } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { computed, ref, useId, watch } from 'vue'
import { getLocale, pluralize } from '@/locales/state'
import type { BaseInput } from '@components/BaseInput'
import { useCustomClass } from '@composables/useCustomClass'
import { useFormDisabled } from '@composables/useFormContext'
import type { AutocompleteOption, AutocompleteProps, BaseAutocompleteEmits } from '../types/BaseAutocomplete.types'

function defaultFilter(option: AutocompleteOption, text: string): boolean {
	return option.label.toLocaleLowerCase(getLocale().intl).includes(text.toLocaleLowerCase(getLocale().intl))
}

function highlightParts(label: string, text: string, isFiltering: boolean): { text: string; isMatch: boolean }[] {
	const start = isFiltering && text ? label.toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) : -1
	if (start === -1) return [{ text: label, isMatch: false }]
	return [
		{ text: label.slice(0, start), isMatch: false },
		{ text: label.slice(start, start + text.length), isMatch: true },
		{ text: label.slice(start + text.length), isMatch: false },
	].filter(part => part.text)
}

function moveOrigin(activeIndex: number, direction: 1 | -1, count: number): number {
	if (activeIndex !== -1) return activeIndex + direction
	return direction === 1 ? 0 : count - 1
}

function useQuery(props: AutocompleteProps) {
	const selectedOption = computed(() => props.options.find(option => option.value === props.modelValue))
	const valueText = (): string => {
		if (selectedOption.value) return selectedOption.value.label
		return props.modelValue === null ? '' : String(props.modelValue)
	}
	const query = ref(valueText())
	const isFiltering = ref(false)

	watch(
		() => [props.modelValue, selectedOption.value?.label],
		() => {
			if (!isFiltering.value) query.value = valueText()
		},
	)

	return {
		query,
		isFiltering,
		valueText,
		visibleOptions: computed(() => {
			const text = query.value.trim()
			const filter = props.filter ?? defaultFilter
			const list =
				props.isRemote || !isFiltering.value || !text ? props.options : props.options.filter(option => filter(option, text))
			return props.maxResults ? list.slice(0, props.maxResults) : list
		}),
	}
}

function useActiveOption(visibleOptions: ComputedRef<AutocompleteOption[]>) {
	const activeIndex = ref(-1)
	const firstEnabled = (from: number, direction: 1 | -1): number => {
		const options = visibleOptions.value
		for (let offset = 0; offset < options.length; offset++) {
			const index = (from + offset * direction + options.length) % options.length
			if (!options[index].isDisabled) return index
		}
		return -1
	}

	watch(visibleOptions, options => {
		if (activeIndex.value >= options.length) activeIndex.value = -1
	})

	return {
		activeIndex,
		firstEnabled,
		move(direction: 1 | -1): void {
			const count = visibleOptions.value.length
			if (count === 0) return
			activeIndex.value = firstEnabled(moveOrigin(activeIndex.value, direction, count), direction)
		},
	}
}

function useListOpen(
	props: AutocompleteProps,
	canOpen: ComputedRef<boolean>,
	list: ReturnType<typeof useQuery> & ReturnType<typeof useActiveOption>,
) {
	const isOpen = ref(false)
	return {
		isOpen,
		open(edge?: 'first' | 'last'): void {
			if (!canOpen.value) return
			isOpen.value = true
			const options = list.visibleOptions.value
			const selectedIndex = options.findIndex(option => option.value === props.modelValue)
			if (edge === 'first') list.activeIndex.value = selectedIndex >= 0 ? selectedIndex : list.firstEnabled(0, 1)
			else if (edge === 'last')
				list.activeIndex.value = selectedIndex >= 0 ? selectedIndex : list.firstEnabled(options.length - 1, -1)
		},
		close(): void {
			isOpen.value = false
			list.activeIndex.value = -1
		},
	}
}

function useSelection(props: AutocompleteProps, emit: BaseAutocompleteEmits, state: ReturnType<typeof useQuery> & { close: () => void }) {
	const setValue = (value: string | number | null): void => {
		if (value === props.modelValue) return
		emit('update:modelValue', value)
		emit('change', value)
	}
	return {
		setValue,
		selectOption(option: AutocompleteOption): void {
			if (option.isDisabled) return
			state.isFiltering.value = false
			state.query.value = option.label
			setValue(option.value)
			state.close()
		},
		commitQuery(): void {
			if (!state.isFiltering.value) return
			state.isFiltering.value = false
			const text = state.query.value.trim()
			const exact = props.options.find(option => !option.isDisabled && option.label.toLocaleLowerCase() === text.toLocaleLowerCase())
			if (!text) setValue(null)
			else if (exact) setValue(exact.value)
			else if (props.isCustomAllowed) {
				const custom = props.normalize ? props.normalize(text) : text
				if (custom !== null) setValue(custom)
			}
			state.query.value = state.valueText()
		},
	}
}

function useAutocompleteState(props: AutocompleteProps, emit: BaseAutocompleteEmits, canOpen: ComputedRef<boolean>) {
	const query = useQuery(props)
	const active = useActiveOption(query.visibleOptions)
	const list = useListOpen(props, canOpen, { ...query, ...active })
	return { canOpen, ...query, ...active, ...list, ...useSelection(props, emit, { ...query, close: list.close }) }
}

function handleEscape(event: KeyboardEvent, ctx: ReturnType<typeof useAutocompleteState>): void {
	if (ctx.isOpen.value) {
		event.preventDefault()
		ctx.close()
	} else if (ctx.query.value) {
		event.preventDefault()
		ctx.isFiltering.value = false
		ctx.query.value = ''
		ctx.setValue(null)
	}
}

function handleEnter(event: KeyboardEvent, ctx: ReturnType<typeof useAutocompleteState>): void {
	const option = ctx.isOpen.value ? ctx.visibleOptions.value[ctx.activeIndex.value] : undefined
	if (option) {
		event.preventDefault()
		ctx.selectOption(option)
	} else {
		ctx.commitQuery()
		ctx.close()
	}
}

function createKeyActions(ctx: ReturnType<typeof useAutocompleteState>): Map<string, (event: KeyboardEvent) => void> {
	return new Map<string, (event: KeyboardEvent) => void>([
		[
			'ArrowDown',
			event => {
				event.preventDefault()
				if (!ctx.isOpen.value) ctx.open(event.altKey ? undefined : 'first')
				else if (!event.altKey) ctx.move(1)
			},
		],
		[
			'ArrowUp',
			event => {
				event.preventDefault()
				if (event.altKey) ctx.close()
				else if (!ctx.isOpen.value) ctx.open('last')
				else ctx.move(-1)
			},
		],
		['Enter', event => handleEnter(event, ctx)],
		['Escape', event => handleEscape(event, ctx)],
		['Tab', () => ctx.close()],
	])
}

function useFieldEvents(emit: BaseAutocompleteEmits, ctx: ReturnType<typeof useAutocompleteState>) {
	const keyActions = createKeyActions(ctx)
	return {
		handleInput(text: string | number): void {
			ctx.query.value = String(text)
			ctx.isFiltering.value = true
			ctx.activeIndex.value = -1
			emit('search', ctx.query.value)
			if (ctx.canOpen.value) ctx.isOpen.value = true
		},
		handleClick(): void {
			if (!ctx.isOpen.value) ctx.open()
		},
		handleKeydown(event: KeyboardEvent): void {
			if (!ctx.canOpen.value) return
			keyActions.get(event.key)?.(event)
		},
		handleBlur(event: FocusEvent): void {
			ctx.commitQuery()
			ctx.close()
			emit('blur', event)
		},
	}
}

function useAutocompleteView(props: AutocompleteProps, ctx: ReturnType<typeof useAutocompleteState>, listboxId: string) {
	const optionId = (index: number): string => `${listboxId}-option-${index}`
	return {
		optionId,
		highlight: (label: string) => highlightParts(label, ctx.query.value.trim(), ctx.isFiltering.value),
		statusText: computed(() => {
			if (!ctx.isOpen.value || !ctx.isFiltering.value) return ''
			if (props.isLoading) return UI_TEXT.LOADING
			const count = ctx.visibleOptions.value.length
			return count > 0 ? pluralize(getLocale().plural.SEARCH_RESULTS, count) : UI_TEXT.NO_RESULTS
		}),
		comboboxAttrs: computed(() => ({
			...props.inputAttrs,
			role: 'combobox',
			autocomplete: 'off',
			'aria-autocomplete': 'list',
			'aria-expanded': ctx.isOpen.value ? 'true' : 'false',
			'aria-controls': ctx.isOpen.value ? listboxId : undefined,
			'aria-activedescendant': ctx.isOpen.value && ctx.activeIndex.value >= 0 ? optionId(ctx.activeIndex.value) : undefined,
		})),
	}
}

export function useBaseAutocomplete(props: AutocompleteProps, emit: BaseAutocompleteEmits) {
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'panel', 'option', 'empty'] })
	const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)
	const listboxId = `rise-autocomplete-${useId()}-listbox`
	const isControlDisabled = useFormDisabled(() => props.isDisabled)
	const ctx = useAutocompleteState(
		props,
		emit,
		computed(() => !isControlDisabled.value && !props.isReadonly),
	)

	return {
		classes,
		inputRef,
		listboxId,
		isControlDisabled,
		query: ctx.query,
		isOpen: ctx.isOpen,
		activeIndex: ctx.activeIndex,
		visibleOptions: ctx.visibleOptions,
		open: ctx.open,
		selectOption: ctx.selectOption,
		...useAutocompleteView(props, ctx, listboxId),
		...useFieldEvents(emit, ctx),
		exposed: {
			focus: () => inputRef.value?.focus(),
			blur: () => inputRef.value?.blur(),
			validate: () => inputRef.value?.validate() ?? true,
			reset: () => inputRef.value?.reset(),
		},
	}
}
