import React, { useMemo, useState } from 'react'

function App() {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useMemo(() => {
    fetch('https://fapi.binance.com/fapi/v1/exchangeInfo')
      .then(response => response.json())
      .then(data => {
        let pairValue = []
        const symbols = data.symbols
        const perpetualContracts = symbols.filter(symbol => symbol.contractType === 'PERPETUAL')
        const promises = perpetualContracts.map((pair) =>
          fetch(`https://data-api.binance.vision/api/v3/uiKlines?symbol=${pair.symbol}&interval=4h&limit=1`)
            .then(res => res.json())
            .then(res => pairValue.push({ name: pair.symbol, value: (((res[0][1] - res[0][4]) / res[0][1]) * 100).toFixed(2) }))
            .catch((err) => {
              //errors 
            })
        )
        const settledPromisesResult = Promise.allSettled(promises)
        settledPromisesResult.then(() => {
          const sortedData = pairValue.sort((a, b) => {
            return a.value - b.value
          })
          setData(sortedData)
          setLoading(true)
        })
      })
      .catch(error => {
        console.error('Error fetching perpetual contract pairs:', error);
      })
  }, [])

  return (<>
    <h3>Top 5 -ve Percentage Change</h3>
    {loading
      ? data.slice(0, 5).map((ele) => (
        <div>{ele.name} ___ value: {ele.value} %</div>
      ))
      : 'Loading...'
    }
    <br />
    <h3>Top 5 +ve Percentage Change</h3>
    {loading
      ? data.slice(-5).reverse().map((ele) => (
        <div>{ele.name} ___ value: {ele.value} %</div>
      ))
      : 'Loading...'
    }
  </>
  )
}

export default App