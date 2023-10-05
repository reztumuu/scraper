require('dotenv').config()

const db = require('./src/database')
const service = require('./src/service')

async function main() {
  await db.loadInfo()

  let scrapData = await service.scrap()

  if ( !scrapData.success ) {
    let err = scrapData.results

    console.log(err)
    return service.cron(main, 4000)
  }

  let workSheet = db.sheetsByIndex[0]
  let validHeaders = [
    'SERVER',
    'JUMLAH PENAWARAN',
    'HARGA',
    'RAW PRICE',
    'MATA UANG'
  ]

  try {
    await workSheet.loadHeaderRow(1)
    let {
      headerValues } = workSheet

    if (
      ( headerValues.length !== 5 ) ||
      ( JSON.stringify(headerValues) !==
        JSON.stringify(validHeaders) )
    ) {
      throw new Error()
    }
  } catch (err) {
    await workSheet.setHeaderRow(validHeaders, 1)
  }

  let sheetData = await workSheet.getRows()

  if ( !sheetData.length ) {
    let datas = scrapData.results.map(s => ({
      'SERVER': s.title,
      'JUMLAH PENAWARAN': s.offer,
      'HARGA': s.price,
      'RAW PRICE': s.raw_price,
      'MATA UANG': s.currency
    }))

    await workSheet.addRows(datas)
    return service.cron(main, 4000)
  }

  let error = false

  for ( let s of scrapData.results ) {
    let updatedData = {}
    let savedTitles = sheetData.map(x => x.get('SERVER'))

    let row = savedTitles.indexOf(s.title)

    if ( row === -1 ) {
      let dataToAdd = {
        'SERVER': s.title,
        'JUMLAH PENAWARAN': s.offer,
        'HARGA': s.price,
        'RAW PRICE': s.raw_price,
        'MATA UANG': s.currency
      }

      await workSheet.addRow(dataToAdd)
      continue
    }

    let oldData = sheetData[row]

    let oldTitle = oldData.get('SERVER').toString()
    let newTitle = s.title.toString()
    if ( oldTitle !== newTitle ) updatedData['SERVER'] = s.title

    let oldOffer = oldData.get('JUMLAH PENAWARAN').toString()
    let newOffer = s.offer.toString()
    if ( oldOffer !== newOffer ) updatedData['JUMLAH PENAWARAN'] = s.offer

    let oldPrice = oldData.get('HARGA').toString()
    let newPrice = s.price.toString()
    if ( oldPrice !== newPrice ) updatedData['HARGA'] = s.price

    let oldRawPrice = oldData.get('RAW PRICE').toString().replaceAll(',', '.')
    let newRawPrice = s.raw_price.toString()
    if ( oldRawPrice !== newRawPrice ) updatedData['RAW PRICE'] = s.raw_price

    let oldCurrency = oldData.get('MATA UANG').toString()
    let newCurrency = s.currency.toString()
    if ( oldCurrency !== newCurrency ) updatedData['MATA UANG'] = s.currency

    if ( !Object.keys(updatedData).length ) {
      continue
    }

    try {
      oldData.assign(updatedData)
      await oldData.save()
    } catch (err) {
      error = true
      console.log(err.message)
      break
    }
  }

  let time = error ? 14000 : 4000
  service.cron(main, time)
}

main()
