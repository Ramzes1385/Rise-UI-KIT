import type { Meta } from '@storybook/vue3-vite'
import type BaseVoiceRecorder from '../ui/BaseVoiceRecorder.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Запись голосового сообщения с микрофона: запрос доступа, пульсирующая точка, время, живой уровень звука,',
				'«Остановить» и «Отменить»; затем прослушивание (BaseAudioPlayer) с «Удалить» и «Отправить».',
				'',
				'- Событие `record` отдаёт `{ blob, mimeType, duration, peaks }`: файл загружает приложение, `peaks` — волна для',
				'  BaseAudioPlayer и вложения BaseChat. Без `hasPreview` запись отдаётся сразу после остановки.',
				'- Формат — первый поддерживаемый браузером: audio/webm или audio/ogg (Opus), в Safari — audio/mp4; свой — `mimeType`.',
				'- `maxDuration` останавливает запись сама (по умолчанию 5 минут). Через ref — `start()`, `stop()`, `cancel()`.',
				'- Ошибки: нет доступа к микрофону, микрофона нет, браузер не умеет записывать — текст в компоненте и событие `error`.',
				'- Скринридер слышит «Идёт запись» и «Запись 0:05 готова»; уровень звука скрыт от него.',
				'- В stories вместо настоящего микрофона — эмуляция: синтезированный голос через Web Audio.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseVoiceRecorder>['parameters']
