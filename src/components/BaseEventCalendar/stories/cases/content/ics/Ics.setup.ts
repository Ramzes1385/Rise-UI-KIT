import { ref } from 'vue'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import { downloadIcs, parseIcs, readIcsFile } from '@utils/calendar/icsUtils'

const SAMPLE_ICS = [
	'BEGIN:VCALENDAR',
	'VERSION:2.0',
	'PRODID:-//Rise Example//RU',
	'BEGIN:VEVENT',
	'UID:retro',
	'DTSTART:20261002T150000',
	'DURATION:PT1H30M',
	'SUMMARY:Ретроспектива',
	'RESOURCES:room-1',
	'END:VEVENT',
	'BEGIN:VEVENT',
	'UID:moscow',
	'DTSTART;TZID=Europe/Moscow:20261008T120000',
	'DTEND;TZID=Europe/Moscow:20261008T130000',
	'SUMMARY:Созвон с офисом в Москве',
	'END:VEVENT',
	'BEGIN:VEVENT',
	'UID:offsite',
	'DTSTART;VALUE=DATE:20261012',
	'DURATION:P2D',
	'SUMMARY:Выездная сессия',
	'END:VEVENT',
	'BEGIN:VEVENT',
	'UID:sync',
	'DTSTART:20261001T090000',
	'DTEND:20261001T093000',
	'RRULE:FREQ=WEEKLY;BYDAY=TH;COUNT=4',
	'SUMMARY:Синк команды',
	'END:VEVENT',
	'END:VCALENDAR',
].join('\r\n')

export function setup() {
	const events = ref<CalendarEvent[]>([])
	const log = ref('Загрузите пример или свой файл .ics')

	function load(list: CalendarEvent[]): void {
		events.value = list
		log.value = `Импортировано событий: ${list.length}`
	}

	function loadSample(): void {
		load(parseIcs(SAMPLE_ICS))
	}

	async function importFile(event: Event): Promise<void> {
		const file = (event.target as HTMLInputElement).files?.[0]
		if (file) load(await readIcsFile(file))
	}

	function exportFile(): void {
		downloadIcs(events.value, 'team')
	}

	return { events, log, loadSample, importFile, exportFile }
}
