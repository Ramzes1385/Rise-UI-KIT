import { ref } from 'vue'
import type { FileManagerItem } from '@components/BaseFileManager'

const FOLDER_NAMES = [
	'Материалы для согласования с юридическим отделом и внешними подрядчиками',
	'Благовещенскийгосударственныйуниверситет_сканы_документов',
	'Архив переписки с клиентами за прошлые годы',
]

export function setup() {
	const folders = FOLDER_NAMES.map((name, index): FileManagerItem => ({
		id: `folder-${index}`,
		name,
		type: 'folder',
		modifiedAt: new Date(2025, 2, 10 + index, 9, 0),
	}))
	const files = Array.from({ length: 120 }, (_, index): FileManagerItem => ({
		id: `file-${index}`,
		name: `Итоговый отчёт по результатам проверки подразделений за ${index + 1}-й период (окончательная редакция, с учётом замечаний).pdf`,
		type: 'file',
		size: 120000 + index * 73000,
		mime: 'application/pdf',
		modifiedAt: new Date(2025, 0, 1 + (index % 28), 8 + (index % 10), (index * 7) % 60),
	}))
	const items = ref<FileManagerItem[]>([...folders, ...files])

	return { items }
}
