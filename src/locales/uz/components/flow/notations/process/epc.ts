/** Нотация EPC (eEPC) BaseFlowMap: виды, правила, предупреждения */
export const uzFlowEpc = {
	flowEpc: {
		NOTATION: 'EPC / eEPC',
		RULES_SUMMARY:
			'hodisalar va funksiyalar navbatma-navbat keladi; jarayon hodisa bilan boshlanib, hodisa bilan tugaydi; hodisadan keyin OR tarmoqlanishi bo’lmaydi',
		EVENT: 'Hodisa',
		FUNCTION: 'Funksiya',
		AND: 'AND konnektori',
		OR: 'OR konnektori',
		XOR: 'XOR konnektori',
		ORG_UNIT: 'Tashkiliy birlik',
		INFORMATION: 'Axborot ob’ekti',
		PROCESS_INTERFACE: 'Jarayon interfeysi',
		CONTROL: 'Boshqaruv oqimi',
		ASSIGNMENT: 'Funksiyaga biriktirish',
		PROP_LATENCY: 'Bajarilish vaqti, ms',
		SIMULATION: 'Jarayonni ko’rsatish',
		RULE_EVENT_EVENT: 'Ikki hodisa ketma-ket kela olmaydi — orasida funksiya bo’lishi kerak',
		RULE_FUNCTION_FUNCTION: 'Ikki funksiya ketma-ket kela olmaydi — orasida hodisa bo’lishi kerak',
		RULE_EVENT_SPLIT: 'Hodisadan keyin OR yoki XOR tarmoqlanishi bo’lmaydi: hodisa qaror qabul qilmaydi, qarorni funksiya qabul qiladi',
		RULE_ASSIGNMENT: 'Tashkiliy birlik va axborot ob’ekti faqat funksiya bilan bog’lanadi',
		RULE_ASIDE_FLOW: 'Tashkiliy birlik va axborot ob’ekti boshqaruv oqimiga kirmaydi',
		WARN_START: 'Jarayon “{name}” dan boshlanadi — u hodisadan boshlanishi kerak',
		WARN_END: 'Jarayon “{name}” da tugaydi — u hodisa bilan tugashi kerak',
		WARN_ALTERNATION: 'Hodisalar va funksiyalar navbatlashmayapti: “{source}” → “{target}”',
		WARN_EVENT_SPLIT: '“{name}” hodisasidan keyin OR yoki XOR tarmoqlanishi turibdi',
	},
}
