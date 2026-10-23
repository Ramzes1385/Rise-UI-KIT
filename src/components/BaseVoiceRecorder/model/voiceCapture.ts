import type { VoiceRecorderError } from '../types/BaseVoiceRecorder.types'

const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mp4']

const ERROR_CODES: Record<string, VoiceRecorderError['code']> = {
	NotAllowedError: 'denied',
	SecurityError: 'denied',
	NotFoundError: 'no-device',
	OverconstrainedError: 'no-device',
}

export function canRecord(hasSource: boolean): boolean {
	return typeof MediaRecorder !== 'undefined' && (hasSource || Boolean(globalThis.navigator?.mediaDevices?.getUserMedia))
}

export function isInsecurePage(hasSource: boolean): boolean {
	return !hasSource && globalThis.isSecureContext === false
}

export function openStream(request: (() => Promise<MediaStream>) | undefined): Promise<MediaStream> {
	return request ? request() : navigator.mediaDevices.getUserMedia({ audio: true })
}

export function pickMimeType(preferred: string | undefined): string {
	const candidates = preferred ? [preferred, ...MIME_TYPES] : MIME_TYPES
	return candidates.find(type => MediaRecorder.isTypeSupported(type)) ?? ''
}

export function captureError(cause: unknown): VoiceRecorderError {
	return { code: ERROR_CODES[(cause as DOMException | undefined)?.name ?? ''] ?? 'failed', cause }
}

export function stopStream(stream: MediaStream | null): void {
	stream?.getTracks().forEach(track => track.stop())
}

export function levelOf(samples: Uint8Array): number {
	let sum = 0
	for (const sample of samples) sum += ((sample - 128) / 128) ** 2
	return Math.min(1, Math.sqrt(sum / Math.max(samples.length, 1)) * 3)
}
