import { describeLibraryModel } from '../../libraryChecks'
import { buildCode } from '../../../../models/library/learning/code'

describeLibraryModel('code', buildCode, { parts: ['body', 'accent', 'detail'], animations: [], anchorY: 1.0 })
