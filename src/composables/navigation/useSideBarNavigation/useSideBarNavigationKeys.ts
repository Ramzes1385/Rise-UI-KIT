/** Composable: уникальные ключи пунктов сайдбара на одном уровне (дубли различаются порядковым номером) */
import { warn } from '@/locales/warn'
import { computed, watch } from 'vue'
import { UI_WARNINGS } from '@/locales/messages'
import { getItemKey } from './useSideBarNavigationUtils'
import type { BaseSideBarNavigationProps, SideBarItem, SideBarItemKey } from '@components/BaseSideBar/types/BaseSideBar.types'

/** Описание: ключ пункта для `v-for` и раскрытия групп; у пунктов с одинаковым ключом второй и следующие получают `#<номер>` */
function createSideBarKeys(props: BaseSideBarNavigationProps) {
	/** Ключи, о дублях которых уже предупредили: список пунктов пересчитывается при каждом изменении */
	const warnedKeys = new Set<SideBarItemKey>()

	const layout = computed(() => {
		const counts = new Map<SideBarItemKey, number>()
		const keys = new Map<SideBarItem, SideBarItemKey>()

		for (const item of props.items ?? []) {
			const base = getItemKey(item)
			const count = counts.get(base) ?? 0

			counts.set(base, count + 1)
			if (!keys.has(item)) keys.set(item, count === 0 ? base : `${base}#${count}`)
		}

		return { keys, duplicates: [...counts].filter(([, count]) => count > 1).map(([key]) => key) }
	})

	watch(
		() => layout.value.duplicates,
		duplicates => {
			for (const key of duplicates) {
				if (warnedKeys.has(key)) continue
				warnedKeys.add(key)
				warn(UI_WARNINGS.SIDEBAR_DUPLICATE_KEY, { key: String(key) })
			}
		},
		{ immediate: true },
	)

	return { getKey: (item: SideBarItem): SideBarItemKey => layout.value.keys.get(item) ?? getItemKey(item) }
}

export { createSideBarKeys }
