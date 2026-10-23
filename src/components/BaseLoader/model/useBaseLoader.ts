import { computed, ref } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useLoaderOverlay } from './useLoaderOverlay'
import { useLoaderAnnounce } from './useLoaderAnnounce'
import type { LoaderProps } from '../types/BaseLoader.types'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useCustomColor } from '@composables/base/useCustomColor'

export function useBaseLoader(props: LoaderProps) {
	const resolvedLabel = computed((): string => props.label ?? UI_TEXT.LOADING)
	const rootRef = ref<HTMLElement | null>(null)
	useLoaderOverlay(rootRef, () => Boolean(props.isOverlay))

	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'animation', 'spinner', 'label'] }),
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		...useLoaderAnnounce(),
		ui: useUi(props, 'base-loader'),
		rootRef,
		resolvedLabel,
		accessibleName: computed((): string => resolvedLabel.value.replace(/[.…\s]+$/, '') || UI_TEXT.LOADING_ARIA),
	}
}
