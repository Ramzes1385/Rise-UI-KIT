import { computeWaveformPeaks, decodeWaveformPeaks, formatMediaTime, parseMediaTime, resampleLevels } from '../mediaUtils'

describe('formatMediaTime', () => {
	it.each([
		[0, '0:00'],
		[5.9, '0:05'],
		[83, '1:23'],
		[600, '10:00'],
		[3725, '1:02:05'],
		[Number.NaN, '0:00'],
		[Number.POSITIVE_INFINITY, '0:00'],
		[-3, '0:00'],
	])('%d с → %s', (seconds, expected) => {
		expect(formatMediaTime(seconds)).toBe(expected)
	})

	it('часы показываются, если они есть у длительности: ширина текста не прыгает', () => {
		expect(formatMediaTime(83, 3725)).toBe('0:01:23')
		expect(formatMediaTime(83, Number.NaN)).toBe('1:23')
	})
})

describe('parseMediaTime', () => {
	it.each([
		['90', 90],
		['90.5', 90.5],
		['1:30', 90],
		['1:02:03', 3723],
		['1m30s', 90],
		['1h2m3s', 3723],
		['2h', 7200],
		[' 45 ', 45],
	])('%s → %d', (value, expected) => {
		expect(parseMediaTime(value)).toBe(expected)
	})

	it.each([null, '', 'abc', '1:5x', 'm'])('%s — не время', value => {
		expect(parseMediaTime(value)).toBeNull()
	})
})

describe('computeWaveformPeaks', () => {
	it('пик модуля в каждом отрезке, нормированный на максимум', () => {
		expect(computeWaveformPeaks([0.1, -0.2, 0.05, 0.4, -0.8, 0.2], 3)).toEqual([0.25, 0.5, 1])
	})

	it('тишина — нули; столбиков больше, чем отсчётов, и ноль столбиков', () => {
		expect(computeWaveformPeaks([0, 0, 0, 0], 2)).toEqual([0, 0])
		expect(computeWaveformPeaks([0.5], 2)).toEqual([0, 1])
		expect(computeWaveformPeaks([0.5, 0.2], 0)).toEqual([])
	})
})

describe('resampleLevels', () => {
	it('среднее уровней в каждом отрезке, нормированное на максимум', () => {
		const levels = resampleLevels([0.2, 0.4, 0.1, 0.1, 0.8, 0.8], 3)
		expect(levels[0]).toBeCloseTo(0.375)
		expect(levels.slice(1)).toEqual([0.125, 1])
	})

	it('уровней меньше, чем столбиков, — повторяются; пустой ряд и ноль столбиков', () => {
		expect(resampleLevels([0.5, 1], 4)).toEqual([0.5, 0.5, 1, 1])
		expect(resampleLevels([], 4)).toEqual([])
		expect(resampleLevels([0.3], 0)).toEqual([])
	})
})

describe('decodeWaveformPeaks', () => {
	const decoded = { getChannelData: () => new Float32Array([0.5, -1, 0.25, 0.5]) }

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	function stubAudio(options: { ok?: boolean; fails?: boolean } = {}) {
		const decodeAudioData = vi.fn(async () => {
			if (options.fails) throw new DOMException('bad', 'EncodingError')
			return decoded
		})
		vi.stubGlobal(
			'OfflineAudioContext',
			vi.fn(function OfflineAudioContext() {
				return { decodeAudioData }
			}),
		)
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({ ok: options.ok ?? true, arrayBuffer: async () => new ArrayBuffer(8) })),
		)
		return { decodeAudioData }
	}

	it('скачивает файл, декодирует первый канал и считает амплитуды', async () => {
		stubAudio()
		await expect(decodeWaveformPeaks('/voice.ogg', 2)).resolves.toEqual([1, 0.5])
		expect(fetch).toHaveBeenCalledWith('/voice.ogg')
	})

	it('ошибка сервера, декодирования или нет Web Audio — null', async () => {
		stubAudio({ ok: false })
		await expect(decodeWaveformPeaks('/missing.ogg', 2)).resolves.toBeNull()
		stubAudio({ fails: true })
		await expect(decodeWaveformPeaks('/broken.ogg', 2)).resolves.toBeNull()
		vi.stubGlobal('OfflineAudioContext', undefined)
		await expect(decodeWaveformPeaks('/voice.ogg', 2)).resolves.toBeNull()
	})
})
