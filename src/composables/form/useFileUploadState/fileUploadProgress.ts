/** Утилиты: имитация прогресса загрузки файлов */
import type { Ref } from 'vue'
import type { FileUploadProgress } from './types/useFileUploadState.types'
import type { UploadedFile } from '@components/BaseFileUpload/types/BaseFileUpload.types'

/** Имитация загрузки: прибавка прогресса за шаг — от PROGRESS_STEP_MIN до PROGRESS_STEP_MIN + PROGRESS_STEP_RANGE, % */
const PROGRESS_STEP_MIN = 5
const PROGRESS_STEP_RANGE = 20
/** Интервал шагов, мс */
const PROGRESS_INTERVAL_MS = 200

/** Описание: прибавляет шаг прогресса; true — файл загружен (status 'done', progress 100) */
function advanceProgress(item: UploadedFile): boolean {
	item.progress = Math.min(item.progress + Math.floor(Math.random() * PROGRESS_STEP_RANGE) + PROGRESS_STEP_MIN, 100)
	if (item.progress < 100) return false
	item.status = 'done'
	item.progress = 100
	return true
}

/** Описание: создаёт имитацию прогресса загрузки для списка файлов */
function createUploadProgress(uploadedFiles: Ref<UploadedFile[]>): FileUploadProgress {
	const intervals = new Set<ReturnType<typeof setInterval>>()

	function stop(interval: ReturnType<typeof setInterval>): void {
		clearInterval(interval)
		intervals.delete(interval)
	}

	function simulate(itemId: string): void {
		const interval = setInterval(() => {
			const item = uploadedFiles.value.find(f => f.id === itemId)
			if (!item || advanceProgress(item)) stop(interval)
		}, PROGRESS_INTERVAL_MS)
		intervals.add(interval)
	}

	function clearAll(): void {
		intervals.forEach(clearInterval)
		intervals.clear()
	}

	return { simulate, clearAll }
}

export { createUploadProgress }
