import type { MediaVastOptions } from '../types/MediaAds.types'
import { mergeTracking, parseVastTime, resolveVast, sendPixels, trackingUrl } from '../model/vast'

const INLINE = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1" xmlns="http://www.iab.com/VAST">
	<Ad id="inline-1">
		<InLine>
			<AdTitle><![CDATA[Кроссовки]]></AdTitle>
			<Impression><![CDATA[https://t.example.com/imp?cb=[CACHEBUSTING]]]></Impression>
			<Error><![CDATA[https://t.example.com/error?code=[ERRORCODE]]]></Error>
			<Creatives>
				<Creative>
					<Linear skipoffset="25%">
						<Duration>00:00:20.000</Duration>
						<TrackingEvents>
							<Tracking event="start">https://t.example.com/start</Tracking>
							<Tracking event="firstQuartile">https://t.example.com/q1</Tracking>
							<Tracking event="complete">https://t.example.com/complete</Tracking>
							<Tracking event="creativeView">https://t.example.com/ignored</Tracking>
							<Tracking event="skip"></Tracking>
						</TrackingEvents>
						<VideoClicks>
							<ClickThrough><![CDATA[https://shop.example.com/]]></ClickThrough>
							<ClickTracking>https://t.example.com/click</ClickTracking>
						</VideoClicks>
						<MediaFiles>
							<MediaFile delivery="streaming" type="application/x-mpegURL" width="1920">https://cdn.example.com/ad.m3u8</MediaFile>
							<MediaFile delivery="progressive" type="application/javascript" apiFramework="VPAID">https://cdn.example.com/vpaid.js</MediaFile>
							<MediaFile delivery="progressive" type="video/mp4" width="640">https://cdn.example.com/ad-640.mp4</MediaFile>
							<MediaFile delivery="progressive" type="video/mp4" width="1280">https://cdn.example.com/ad-1280.mp4</MediaFile>
							<MediaFile delivery="progressive" type="video/webm" width="1920">https://cdn.example.com/ad-1920.webm</MediaFile>
						</MediaFiles>
					</Linear>
				</Creative>
			</Creatives>
		</InLine>
	</Ad>
</VAST>`

function wrapperXml(next: string, id: string): string {
	return `<VAST version="3.0"><Ad id="${id}"><Wrapper>
		<Impression>https://w.example.com/${id}/imp</Impression>
		<Error>https://w.example.com/${id}/error?c=[ERRORCODE]</Error>
		<VASTAdTagURI><![CDATA[${next}]]></VASTAdTagURI>
		<Creatives><Creative><Linear><TrackingEvents><Tracking event="start">https://w.example.com/${id}/start</Tracking></TrackingEvents></Linear></Creative></Creatives>
	</Wrapper></Ad></VAST>`
}

function setup(files: Record<string, string>, patch: Partial<MediaVastOptions> = {}) {
	const onError = vi.fn()
	const options: MediaVastOptions = {
		fetchXml: vi.fn(async (url: string) => {
			if (!(url in files)) throw new Error('404')
			return files[url]
		}),
		canPlay: type => type === 'video/mp4',
		width: 900,
		onError,
		...patch,
	}
	return { options, onError }
}

describe('parseVastTime и mergeTracking', () => {
	it.each([
		['00:00:15', 15],
		['01:02:03.5', 3723.5],
		[' 00:01:00.000 ', 60],
		['15', undefined],
		[null, undefined],
	])('%s → %s', (value, expected) => {
		expect(parseVastTime(value)).toBe(expected)
	})

	it('трекинг обёрток и объявления складывается', () => {
		expect(mergeTracking({ start: ['a'], impression: ['i'] }, { start: ['b'], complete: ['c'] })).toEqual({
			start: ['a', 'b'],
			impression: ['i'],
			complete: ['c'],
		})
	})
})

describe('resolveVast', () => {
	it('InLine: название, длительность, пропуск в процентах, ссылка, трекинг и ролик по ширине плеера', async () => {
		const { options, onError } = setup({ '/vast': INLINE })

		expect(await resolveVast('/vast', options)).toEqual([
			{
				id: 'inline-1',
				src: 'https://cdn.example.com/ad-1280.mp4',
				type: 'video/mp4',
				duration: 20,
				skipAfter: 5,
				clickUrl: 'https://shop.example.com/',
				title: 'Кроссовки',
				tracking: {
					impression: ['https://t.example.com/imp?cb=[CACHEBUSTING]'],
					error: ['https://t.example.com/error?code=[ERRORCODE]'],
					click: ['https://t.example.com/click'],
					start: ['https://t.example.com/start'],
					firstQuartile: ['https://t.example.com/q1'],
					complete: ['https://t.example.com/complete'],
				},
			},
		])
		expect(onError).not.toHaveBeenCalled()
		const wide = setup({ '/vast': INLINE }, { width: 2000 })
		expect((await resolveVast('/vast', wide.options))[0].src).toBe('https://cdn.example.com/ad-1280.mp4')
	})

	it('Wrapper: цепочка обёрток, трекинг обёрток добавляется к объявлению', async () => {
		const { options } = setup({ '/w1': wrapperXml('/w2', 'w1'), '/w2': wrapperXml('/inline', 'w2'), '/inline': INLINE })
		const [ad] = await resolveVast('/w1', options)

		expect(ad.tracking?.impression).toEqual([
			'https://w.example.com/w1/imp',
			'https://w.example.com/w2/imp',
			'https://t.example.com/imp?cb=[CACHEBUSTING]',
		])
		expect(ad.tracking?.start).toEqual([
			'https://w.example.com/w1/start',
			'https://w.example.com/w2/start',
			'https://t.example.com/start',
		])
	})

	it('цепочка объявлений (sequence) — по порядку; без sequence — только первое', async () => {
		const pod = INLINE.replace('<Ad id="inline-1">', '<Ad id="second" sequence="2">').replace(
			'</VAST>',
			INLINE.slice(INLINE.indexOf('<Ad '), INLINE.indexOf('</VAST>')).replace('<Ad id="inline-1">', '<Ad id="first" sequence="1">') +
				'</VAST>',
		)
		const { options } = setup({
			'/pod': pod,
			'/buffet': INLINE.replace(
				'</VAST>',
				INLINE.slice(INLINE.indexOf('<Ad '), INLINE.indexOf('</VAST>')).replace('inline-1', 'other') + '</VAST>',
			),
		})

		expect((await resolveVast('/pod', options)).map(ad => ad.id)).toEqual(['first', 'second'])
		expect((await resolveVast('/buffet', options)).map(ad => ad.id)).toEqual(['inline-1'])
	})

	it('ошибки: нет подходящего ролика — 403, пустой ответ — 303, недоступная обёртка и слишком длинная цепочка — 301', async () => {
		const { options, onError } = setup(
			{
				'/no-media': INLINE,
				'/empty': '<VAST version="4.0"><Error>https://t.example.com/empty?c=[ERRORCODE]</Error></VAST>',
				'/broken-wrapper': wrapperXml('/missing', 'b'),
				'/no-uri': '<VAST><Ad><Wrapper><Error>https://t.example.com/nouri</Error></Wrapper></Ad></VAST>',
				'/loop': wrapperXml('/loop', 'loop'),
				'/no-linear': '<VAST><Ad><InLine><Error>https://t.example.com/nolinear</Error><Creatives /></InLine></Ad></VAST>',
			},
			{ canPlay: () => false, maxDepth: 2 },
		)

		expect(await resolveVast('/no-media', options)).toEqual([])
		expect(await resolveVast('/empty', options)).toEqual([])
		expect(await resolveVast('/broken-wrapper', options)).toEqual([])
		expect(await resolveVast('/no-uri', options)).toEqual([])
		expect(await resolveVast('/loop', options)).toEqual([])
		expect(await resolveVast('/no-linear', options)).toEqual([])
		expect(onError.mock.calls).toEqual([
			[['https://t.example.com/error?code=[ERRORCODE]'], 403],
			[['https://t.example.com/empty?c=[ERRORCODE]'], 303],
			[['https://w.example.com/b/error?c=[ERRORCODE]'], 301],
			[['https://t.example.com/nouri'], 301],
			[
				[
					'https://w.example.com/loop/error?c=[ERRORCODE]',
					'https://w.example.com/loop/error?c=[ERRORCODE]',
					'https://w.example.com/loop/error?c=[ERRORCODE]',
				],
				301,
			],
			[['https://t.example.com/nolinear'], 403],
		])
	})
})

describe('пиксели трекинга', () => {
	it('макросы: код ошибки, позиция объявления, метка времени и защита от кэша', () => {
		const url = trackingUrl('https://t.example.com/e?c=[ERRORCODE]&p=[ADPLAYHEAD]&t=[TIMESTAMP]&r=[CACHEBUSTING]', {
			errorCode: 405,
			adTime: 3725.5,
		})

		expect(url).toMatch(/^https:\/\/t\.example\.com\/e\?c=405&p=01%3A02%3A05\.500&t=\d{4}-\d{2}-\d{2}T[^&]+&r=\d{8}$/)
		expect(trackingUrl('https://t.example.com/e?c=[ERRORCODE]&p=[ADPLAYHEAD]', {})).toBe(
			'https://t.example.com/e?c=900&p=00%3A00%3A00.000',
		)
	})

	it('каждый адрес — картинка-пиксель; без адресов ничего не отправляется', () => {
		const sent: string[] = []
		vi.stubGlobal(
			'Image',
			class {
				set src(value: string) {
					sent.push(value)
				}
			},
		)

		sendPixels(['https://t.example.com/a', 'https://t.example.com/b?c=[ERRORCODE]'], { errorCode: 303 })
		sendPixels(undefined)
		expect(sent).toEqual(['https://t.example.com/a', 'https://t.example.com/b?c=303'])
		vi.unstubAllGlobals()
	})
})
