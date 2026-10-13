import { ref } from 'vue'
import { getLocale } from '@/locales/state'
import { useGanttPointer } from './useGanttPointer'
import { editedTask, isChanged, keyboardEdit } from './ganttEdit'
import type { GanttChangeSource } from '../../types/BaseGantt.types'
import { DEFAULT_DATE_FORMAT, editMessage } from '../calendar/ganttFormat'
import type { GanttContext, GanttEdit, GanttItem } from '../../types/BaseGanttModel.types'

export function useGanttEditing(context: GanttContext) {
	const status = ref('')

	function commit(item: GanttItem, edit: GanttEdit, source: GanttChangeSource): void {
		if (!isChanged(item, edit)) return
		const task = editedTask(item, edit)
		context.emit('update:task', task)
		context.emit('task-change', { task, previous: item.task, kind: edit.kind, source })
		status.value = editMessage(item, edit, new Intl.DateTimeFormat(getLocale().intl, context.props.dateFormat ?? DEFAULT_DATE_FORMAT))
	}

	return {
		status,
		...useGanttPointer(context, (item, edit) => commit(item, edit, 'pointer')),
		editByKey(event: KeyboardEvent, item: GanttItem): boolean {
			const canEdit = context.props.isEditable && !context.props.isDisabled
			const input = { key: event.key, isShift: event.shiftKey, scale: context.metrics.value.scale }
			const edit = canEdit ? keyboardEdit(item, input) : null
			if (edit) commit(item, edit, 'keyboard')
			return Boolean(edit)
		},
	}
}
