const { GoogleSpreadsheet } = require('google-spreadsheet')
const { JWT } = require('google-auth-library')

const scopes = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
]

const auth = new JWT({
  key: process.env.SHEET_KEY.replace(/\\n/g, "\n"),
  scopes,
  email: process.env.SHEET_EMAIL,
})

const docs = new GoogleSpreadsheet(process.env.SHEET_ID, auth)

module.exports = docs
