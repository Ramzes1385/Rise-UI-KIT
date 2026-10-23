import { describeLibraryModel } from '../../libraryChecks'
import { buildMailbox } from '../../../../models/library/ops/mailbox'

describeLibraryModel('mailbox', buildMailbox, {
	parts: ['body', 'accent', 'detail', 'metal', 'light'],
	animations: ['send'],
	anchorY: 1.26,
})
