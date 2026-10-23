import type { ChecklistItem } from '../types/BaseChecklist.types'

export const ONBOARDING: ChecklistItem[] = [
	{ id: 'install', title: 'Установить пакет', description: 'npm install @ramzes1385/rise-ui-kit' },
	{ id: 'plugin', title: 'Подключить плагин', description: 'app.use(RiseUiKit) и стили в main.ts', actionLabel: 'Открыть инструкцию' },
	{ id: 'theme', title: 'Выбрать тему', description: 'Светлая, тёмная или по системе', actionLabel: 'Настроить тему' },
	{ id: 'first', title: 'Собрать первую форму', actionLabel: 'Открыть пример' },
]
