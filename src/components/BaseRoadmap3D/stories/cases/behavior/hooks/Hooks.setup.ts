import { ref } from 'vue'

export function setup() {
	const log = ref('Сцена строится…')
	const modelCount = ref(0)

	function onSceneReady(): () => void {
		log.value = 'Сцена собрана'
		return () => {
			log.value = 'Сцена убрана'
		}
	}

	function onModelReady(): void {
		modelCount.value += 1
	}

	return { log, modelCount, onSceneReady, onModelReady }
}
