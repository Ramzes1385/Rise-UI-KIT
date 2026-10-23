import { ref, useTemplateRef } from 'vue'
import type { BaseListExpose, ListItem } from '@components/BaseList'

export function setup() {
	const tasks = ref<ListItem[]>([
		{ id: 'design', title: 'Макет главной', description: 'Дизайн', icon: 'image' },
		{ id: 'api', title: 'Метод выгрузки', description: 'Бэкенд', icon: 'code' },
		{ id: 'tests', title: 'Тесты оплаты', description: 'Качество', icon: 'check' },
	])
	const list = useTemplateRef<BaseListExpose>('list')

	function moveBy(id: string, step: number): void {
		const index = tasks.value.findIndex(task => task.id === id)
		list.value?.moveItem(id, index + step)
	}

	function remove(id: string): void {
		tasks.value = tasks.value.filter(task => task.id !== id)
	}

	return { tasks, moveBy, remove }
}
