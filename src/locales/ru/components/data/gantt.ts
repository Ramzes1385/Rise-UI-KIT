/** Русские строки диаграммы Ганта (BaseGantt) */
export const ruGantt = {
	gantt: {
		LABEL: 'Диаграмма Ганта',
		TASK_COLUMN: 'Задача',
		TIMELINE: 'Шкала времени',
		LOADING: 'Загрузка задач',
		EMPTY: 'Нет задач',
		TASK_LABEL: '{name}: {start} — {end}, {progress} %',
		MILESTONE_LABEL: '{name}: {date}, веха',
		EDIT_HINT: 'Стрелки сдвигают задачу, Shift со стрелками меняет длительность, Escape возвращает к строке',
		MOVED: 'Задача «{name}» перенесена: {start} — {end}',
		RESIZED: 'Длительность задачи «{name}»: {duration}, {start} — {end}',
		MILESTONE_MOVED: 'Веха «{name}» перенесена: {date}',
		WARN_DUPLICATE_ID: 'BaseGantt: повторяющийся id «{id}» — вторая задача пропущена',
		WARN_BAD_DATE: 'BaseGantt: у задачи «{id}» нет корректной даты начала или окончания — задача пропущена',
		WARN_BAD_RANGE: 'BaseGantt: у задачи «{id}» окончание раньше начала — окончание приравнено к началу',
		WARN_BAD_PARENT: 'BaseGantt: у задачи «{id}» нет родителя «{parentId}» — задача показана на верхнем уровне',
		WARN_PARENT_CYCLE: 'BaseGantt: parentId задачи «{id}» замыкает цикл — задача показана на верхнем уровне',
		WARN_BAD_DEPENDENCY: 'BaseGantt: зависимость задачи «{id}» от «{dependencyId}» игнорируется — такой задачи нет',
		WARN_DEPENDENCY_CYCLE: 'BaseGantt: зависимость задачи «{id}» от «{dependencyId}» игнорируется — она замыкает цикл',
	},
}
