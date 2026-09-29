import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseVoiceRecorder from '../ui/BaseVoiceRecorder.vue'
import { levelOf, pickMimeType } from '../model/voiceCapture'
import { fireEvent, render, screen } from '@testing-library/vue'
import { installRecorderEnvironment, removeRecorderEnvironment } from './recorder.test-utils'
import type { BaseVoiceRecorderExpose, VoiceRecording } from '../types/BaseVoiceRecorder.types'

async function startRecording(props: Record<string, unknown> = {}) {
	const env = installRecorderEnvironment()
	const result = render(BaseVoiceRecorder, { props })
	await fireEvent.click(screen.getByRole('button', { name: 'Записать голосовое сообщение' }))
	await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Остановить запись' })).toBeEnabled())
	return { ...result, env }
}

describe('BaseVoiceRecorder', () => {
	beforeEach(() => {
		vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] })
	})

	afterEach(() => {
		vi.useRealTimers()
		removeRecorderEnvironment()
	})

	it('запись: доступ к микрофону, время, уровень, статус; остановка — прослушивание, «Отправить» отдаёт запись', async () => {
		const { env, emitted, container } = await startRecording()
		expect(env.getUserMedia).toHaveBeenCalledWith({ audio: true })
		expect(env.recorder().mimeType).toBe('audio/webm;codecs=opus')
		expect(screen.getByRole('status')).toHaveTextContent('Идёт запись')
		expect(container.querySelectorAll('.base-voice-recorder__level')).toHaveLength(32)
		await vi.advanceTimersByTimeAsync(3100)
		expect(container.querySelector('.base-voice-recorder__time')).toHaveTextContent('0:03')

		await fireEvent.click(screen.getByRole('button', { name: 'Остановить запись' }))
		expect(env.track.stop).toHaveBeenCalled()
		expect(screen.getByRole('group', { name: 'Записанное сообщение' })).toBeInTheDocument()
		expect(screen.getByRole('status')).toHaveTextContent('Запись 0:03 готова')
		await fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))
		const [recording] = (emitted('record') as Array<[VoiceRecording]>)[0]
		expect(recording).toMatchObject({ mimeType: 'audio/webm;codecs=opus' })
		expect(recording.duration).toBeGreaterThanOrEqual(3)
		expect(recording.peaks).toHaveLength(48)
		expect(await recording.blob.text()).toBe('voice')
		expect(env.revokeObjectURL).toHaveBeenCalledWith('blob:recording')
		expect(screen.getByRole('button', { name: 'Записать голосовое сообщение' })).toBeInTheDocument()
		expect((emitted('state-change') as Array<[string]>).map(([state]) => state)).toEqual(['requesting', 'recording', 'preview', 'idle'])
	})

	it('«Удалить» в прослушивании и «Отменить» во время записи: запись не отдаётся', async () => {
		const { emitted, env } = await startRecording({ variant: 'soft' })
		env.close.mockRejectedValueOnce(new Error('closed'))
		await fireEvent.click(screen.getByRole('button', { name: 'Отменить запись' }))
		expect(env.track.stop).toHaveBeenCalled()
		await fireEvent.click(screen.getByRole('button', { name: 'Записать голосовое сообщение' }))
		await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Остановить запись' })).toBeEnabled())
		await fireEvent.click(screen.getByRole('button', { name: 'Остановить запись' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить запись' }))
		expect(emitted('record')).toBeUndefined()
		expect(emitted('cancel')).toHaveLength(2)
	})

	it('без прослушивания запись отдаётся сразу; по maxDuration запись останавливается сама', async () => {
		const { emitted } = await startRecording({ hasPreview: false, maxDuration: 2 })
		await vi.advanceTimersByTimeAsync(2200)
		expect(emitted('record')).toHaveLength(1)
		expect(screen.getByRole('button', { name: 'Записать голосовое сообщение' })).toBeInTheDocument()
	})

	it.each([
		['NotAllowedError', 'Нет доступа к микрофону. Разрешите его в настройках браузера', 'denied'],
		['NotFoundError', 'Микрофон не найден', 'no-device'],
		['AbortError', 'Не удалось записать звук', 'failed'],
	])('отказ %s — сообщение и событие error', async (name, text, code) => {
		const env = installRecorderEnvironment()
		env.getUserMedia.mockRejectedValueOnce(new DOMException('no', name))
		const { emitted } = render(BaseVoiceRecorder)
		await fireEvent.click(screen.getByRole('button', { name: 'Записать голосовое сообщение' }))
		await vi.waitFor(() => expect(screen.getByText(text)).toBeInTheDocument())
		expect((emitted('error') as Array<[{ code: string }]>)[0][0].code).toBe(code)
	})

	it('браузер без записи звука — «Браузер не умеет записывать звук»', async () => {
		installRecorderEnvironment()
		vi.stubGlobal('MediaRecorder', undefined)
		render(BaseVoiceRecorder)
		await fireEvent.click(screen.getByRole('button', { name: 'Записать голосовое сообщение' }))
		expect(screen.getByText('Браузер не умеет записывать звук')).toBeInTheDocument()
	})

	it('методы через ref; повторный старт во время записи и старт отключённого — без действия; удаление компонента освобождает микрофон', async () => {
		const env = installRecorderEnvironment()
		vi.stubGlobal('AudioContext', undefined)
		const wrapper = mount(BaseVoiceRecorder, { props: { mimeType: 'audio/ogg;codecs=opus' } })
		const exposed = wrapper.vm as unknown as BaseVoiceRecorderExpose
		await exposed.start()
		await exposed.start()
		expect(env.getUserMedia).toHaveBeenCalledOnce()
		expect(env.recorder().mimeType).toBe('audio/webm;codecs=opus')
		exposed.stop()
		await nextTick()
		exposed.cancel()
		await wrapper.setProps({ isDisabled: true })
		await exposed.start()
		expect(env.getUserMedia).toHaveBeenCalledOnce()
		await wrapper.setProps({ isDisabled: false })
		await exposed.start()
		wrapper.unmount()
		expect(env.track.stop).toHaveBeenCalledTimes(2)
	})

	it('pickMimeType: сначала желаемый, без поддержки — пустая строка; levelOf: тишина и предел', () => {
		installRecorderEnvironment()
		expect(pickMimeType('audio/webm;codecs=vorbis')).toBe('audio/webm;codecs=vorbis')
		expect(pickMimeType(undefined)).toBe('audio/webm;codecs=opus')
		vi.mocked(MediaRecorder.isTypeSupported).mockReturnValue(false)
		expect(pickMimeType(undefined)).toBe('')
		vi.mocked(MediaRecorder.isTypeSupported).mockImplementation((type: string) => type.startsWith('audio/webm'))
		expect(levelOf(new Uint8Array([128, 128]))).toBe(0)
		expect(levelOf(new Uint8Array([0, 255]))).toBe(1)
		expect(levelOf(new Uint8Array([]))).toBe(0)
	})
})
