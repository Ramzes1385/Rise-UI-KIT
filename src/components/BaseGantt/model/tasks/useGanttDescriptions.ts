import { useId } from 'vue'
import type { GanttProps } from '../../types/BaseGantt.types'
import type { GanttRowView } from '../../types/BaseGanttModel.types'

export function useGanttDescriptions(props: GanttProps) {
	const hintId = `${useId()}-hint`
	const dependencyId = (row: GanttRowView): string => `${hintId}-${row.index}`

	return {
		hintId,
		dependencyId,
		describedBy(row: GanttRowView): string | undefined {
			const ids = [props.isEditable ? hintId : '', row.dependencyText ? dependencyId(row) : '']
			return ids.filter(Boolean).join(' ') || undefined
		},
	}
}
