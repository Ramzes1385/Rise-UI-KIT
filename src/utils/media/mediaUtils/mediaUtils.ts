/** Утилиты медиа: время записи (`1:23`, `1:02:05`), разбор таймкода из адреса и амплитуды для волны BaseWaveform */

const SECONDS_IN_HOUR = 3600

const UNIT_SECONDS: Record<string, number> = { h: 3600, m: 60, s: 1 }

function pad(value: number): string {
	return String(value).padStart(2, '0')
}

/** Время записи: `1:23`, `1:02:05`. С `reference` часы показываются и у коротких значений — ширина текста не прыгает */
export function formatMediaTime(seconds: number, reference = seconds): string {
	const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
	const hours = Math.floor(total / SECONDS_IN_HOUR)
	const minutes = Math.floor((total % SECONDS_IN_HOUR) / 60)
	const rest = pad(total % 60)
	const hasHours = hours > 0 || (Number.isFinite(reference) && reference >= SECONDS_IN_HOUR)
	return hasHours ? `${hours}:${pad(minutes)}:${rest}` : `${minutes}:${rest}`
}

/** Таймкод в секундах: `90`, `1:30`, `1:02:03`, `1m30s`, `1h2m3s`; не время — null */
export function parseMediaTime(value: string | null): number | null {
	const text = value?.trim() ?? ''
	if (/^\d+(\.\d+)?$/.test(text)) return Number(text)
	if (/^\d+(:\d{1,2}){1,2}$/.test(text)) return text.split(':').reduce((total, part) => total * 60 + Number(part), 0)
	const units = /^(\d+h)?(\d+m)?(\d+s)?$/.exec(text)
	if (!text || !units) return null
	return units.slice(1).reduce((total, part) => (part ? total + Number(part.slice(0, -1)) * UNIT_SECONDS[part.slice(-1)] : total), 0)
}

function normalize(values: number[]): number[] {
	const max = values.reduce((result, value) => Math.max(result, value), 0)
	return max > 0 ? values.map(value => value / max) : values
}

/** Амплитуды `bars` столбиков от 0 до 1 по отсчётам сигнала: пик модуля в каждом отрезке, нормированный на максимум записи */
export function computeWaveformPeaks(samples: ArrayLike<number>, bars: number): number[] {
	const size = samples.length / Math.max(bars, 1)
	const peaks = Array.from({ length: Math.max(bars, 0) }, (_, bar) => {
		let peak = 0
		for (let index = Math.floor(bar * size); index < Math.floor((bar + 1) * size); index++)
			peak = Math.max(peak, Math.abs(samples[index]))
		return peak
	})
	return normalize(peaks)
}

/** Сжимает ряд уровней (например, снятых во время записи) до `bars` столбиков: среднее в отрезке, нормированное на максимум */
export function resampleLevels(levels: number[], bars: number): number[] {
	if (levels.length === 0) return []
	const size = levels.length / Math.max(bars, 1)
	const averages = Array.from({ length: Math.max(bars, 0) }, (_, bar) => {
		const part = levels.slice(Math.floor(bar * size), Math.max(Math.floor((bar + 1) * size), Math.floor(bar * size) + 1))
		return part.reduce((sum, level) => sum + level, 0) / part.length
	})
	return normalize(averages)
}

/**
 * Амплитуды аудиофайла: скачивает его и декодирует через Web Audio (первый канал).
 * Без Web Audio, при ошибке сети, CORS или декодирования — null.
 */
export async function decodeWaveformPeaks(src: string, bars: number): Promise<number[] | null> {
	if (typeof OfflineAudioContext === 'undefined') return null
	try {
		const response = await fetch(src)
		if (!response.ok) return null
		const buffer = await new OfflineAudioContext(1, 1, 44_100).decodeAudioData(await response.arrayBuffer())
		return computeWaveformPeaks(buffer.getChannelData(0), bars)
	} catch {
		return null
	}
}
