/** Composable: логика BaseLoader — классы, размер, цвет и доступное имя */
import { computed } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useSizeScale } from '@composables/useSizeScale'
import type { LoaderProps } from '../types/BaseLoader.types'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'

export function useBaseLoader(props: LoaderProps) {
	/**
	 * Доступное имя статуса берётся из label, чтобы кастомная подпись («Сохранение…») не расходилась с фиксированным
	 * «Загрузка». Завершающее многоточие — визуальный признак процесса, в имени оно лишнее; пустой label даёт имя по умолчанию.
	 */
	const resolvedLabel = computed((): string => props.label ?? UI_TEXT.LOADING)

	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'animation', 'spinner', 'label'] }),
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		resolvedLabel,
		accessibleName: computed((): string => resolvedLabel.value.replace(/[.…\s]+$/, '') || UI_TEXT.LOADING_ARIA),
	}
}
