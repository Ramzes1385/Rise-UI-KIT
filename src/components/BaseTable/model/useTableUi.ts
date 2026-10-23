import { inject } from 'vue'
import { useUi } from '@composables/base/useUi'
import { TABLE_UI_KEY } from '../types/BaseTable.types'
import type { UiClassFn } from '@composables/base/useUi'
import type { BaseTablePart } from '../types/BaseTable.types'

export function useTableUi(): UiClassFn<BaseTablePart> {
	return inject(TABLE_UI_KEY, null) ?? useUi({}, 'base-table')
}
