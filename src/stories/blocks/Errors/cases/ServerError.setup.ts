import { ref } from 'vue'

const requestId = 'REQ-7F3A-2C91'

export function setup() {
	const attempts = ref(0)
	const isRetrying = ref(false)
	const message = ref('')

	async function retry(): Promise<void> {
		isRetrying.value = true
		attempts.value += 1
		await Promise.resolve()
		isRetrying.value = false
		message.value = `Попытка ${attempts.value}: сервис пока недоступен, попробуйте через минуту`
	}

	function report(): void {
		message.value = `Обращение ${requestId} отправлено в поддержку`
	}

	return { requestId, attempts, isRetrying, message, retry, report }
}
