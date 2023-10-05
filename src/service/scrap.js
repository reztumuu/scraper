const axios = require('axios')

async function scrap() {
  let userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'

  let url = 'https://sls.g2g.com/offer/search'
  let req

  try {
    req = await axios.get(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': userAgent
      },
      params: {
        service_id: 'lgc_service_1',
        brand_id: 'lgc_game_29076',
        sort: 'lowest_price',
        page_size: 100,
        country: 'ID',
        currency: 'IDR'
      }
    })
  } catch (err) {
    return {
      success: false,
      results: err.message
    }
  }

  let data = req.data.payload.results.map(item => {
    return {
      title: item.title,
      offer: item.total_offer,
      raw_price: item.converted_unit_price,
      price: item.display_price,
      currency: item.display_currency
    }
  })

  return {
    success: true,
    results: data
  }
}

module.exports = scrap
