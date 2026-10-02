import { formatMessage } from '@/locales/state'
import { useColumnCount } from './useColumnCount'
import { UI_DESCRIPTIONS } from '@/locales/messages'
import { ref, computed, onBeforeUnmount } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { DescriptionsItem, BaseDescriptionsEmits, BaseDescriptionsProps } from '../types/BaseDescriptions.types'

const COPIED_DURATION = 2000

function writeClipboard(text: string): Promise<boolean> {
	if (typeof navigator === 'undefined' || !navigator.clipboard) return Promise.resolve(false)
	return navigator.clipboard.writeText(text).then(
		() => true,
		() => false,
	)
}

function isEmptyValue(value: DescriptionsItem['value']): boolean {
	return value === null || value === undefined || value === ''
}

function useItemCopy(props: BaseDescriptionsProps, emit: BaseDescriptionsEmits) {
	const status = ref('')
	const copiedKey = ref<string | null>(null)
	let timer: ReturnType<typeof setTimeout> | undefined
	onBeforeUnmount(() => clearTimeout(timer))
	return {
		status,
		copiedKey,
		canCopy: (item: DescriptionsItem): boolean => (item.isCopyable ?? props.isCopyable ?? false) && !isEmptyValue(item.value),
		copyLabel: (item: DescriptionsItem): string => formatMessage(UI_DESCRIPTIONS.COPY, { label: item.label }),
		async copy(item: DescriptionsItem): Promise<void> {
			const text = item.copyText ?? String(item.value)
			const isCopied = await writeClipboard(text)
			status.value = formatMessage(isCopied ? UI_DESCRIPTIONS.COPIED : UI_DESCRIPTIONS.COPY_FAILED, { label: item.label })
			if (!isCopied) return
			copiedKey.value = item.key
			clearTimeout(timer)
			timer = setTimeout(() => {
				copiedKey.value = null
			}, COPIED_DURATION)
			emit('copy', { item, text })
		},
	}
}

export function useBaseDescriptions(props: BaseDescriptionsProps, emit: BaseDescriptionsEmits) {
	const listRef = ref<HTMLElement | null>(null)
	const columnCount = useColumnCount(listRef, props)
	return {
		...useStandardBaseComponent('base-descriptions', props, ['root', 'header', 'list']),
		...useItemCopy(props, emit),
		listRef,
		columnCount,
		listStyle: computed(() => ({
			'--base-descriptions-columns': String(Math.max(1, Math.floor(props.columns ?? 1))),
			'--base-descriptions-min-item-width': `${props.minItemWidth ?? 0}px`,
			'--base-descriptions-label-width': props.labelWidth || undefined,
		})),
		emptyValueText: computed(() => props.emptyValue ?? UI_DESCRIPTIONS.EMPTY_VALUE),
		emptyListText: computed(() => props.emptyText ?? UI_DESCRIPTIONS.EMPTY),
		isEmptyValue,
		itemStyle(item: DescriptionsItem): Record<string, string> {
			if (item.span === 'full') return { gridColumn: '1 / -1', '--base-descriptions-span': String(columnCount.value) }
			if (!item.span || item.span <= 1) return {}
			const span = String(Math.min(Math.floor(item.span), columnCount.value))
			return { gridColumn: `span ${span}`, '--base-descriptions-span': span }
		},
	}
}
