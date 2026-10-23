import { describeLibraryModel } from '../../libraryChecks'
import { buildShield } from '../../../../models/library/goals/shield'

describeLibraryModel('shield', buildShield, { parts: ['body', 'accent', 'detail'], animations: [], anchorY: 1.0 })
