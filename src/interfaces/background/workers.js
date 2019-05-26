import http from 'http'
import fs from 'fs'
import { driver } from '../../infra/databases/database'

/**TODO: Deletar Exchange que não deram match */

// Instantiate the worker module object
const workers = {}

// Do something
workers.importCurrencyValue = function(){
  console.log('\x1b[35m%s\x1b[0m','Importing currency values')
  fs.readFile('wait.txt', function (err, data) {
    if (err) {
      fs.appendFile('wait.txt', 'Doing someting!', function (err) {
        if (err) console.log(err)
        http.get('http://data.fixer.io/api/latest?access_key=44b8add08bfd72bbec693ad74cc88be7', (resp) => {
          let data = ''

          resp.on('data', (chunk) => {
            data += chunk
          })

          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            let currencies = JSON.parse(data)
            Object.keys(currencies.rates).forEach(function (key) {
              const session = driver.session()
              const cypherOldValue = `MATCH (c:Currency {code: "${key}"})<-[r]-(c2:Currency{code:"EUR"}) return r.value as value`
              session.run(cypherOldValue).then(function (response) {
                let valuecompare = 'even'
                if (response.records[0] && response.records[0].get('value') > currencies.rates[key]) {
                  valuecompare = 'down'
                }
                if (response.records[0] && response.records[0].get('value') < currencies.rates[key]) {
                  valuecompare = 'up'
                }
                const cypher = `MERGE(cfrom:Currency {code: "EUR"}) MERGE(cto:Currency {code: "${key}"}) MERGE (cfrom)-[v:WORTHS]->(cto) ON MATCH SET v.value = ${currencies.rates[key].toFixed(2)}, v.status = "${valuecompare}" ON CREATE SET v.value = ${currencies.rates[key].toFixed(2)}, v.status = "${valuecompare}"`
                session
                  .run(cypher)
                  .then(function (result) {
                    session.close()
                  })
                  .catch(function (error) {
                    console.log(error)
                  })
                session.close()
              }).catch((err) => { console.log('error =>', err) })
            })
          })
          return data
        }).on('error', (err) => {
          console.log('\x1b[31m%s\x1b[0', 'Error: ' + err.message)
        })
        fs.unlink('wait.txt', function (err) {
          if (err) throw err
          console.log('\x1b[32m%s\x1b[0','Importing done!')
        })
      })
    }
  })
}

workers.whenAgain = function(minutes) {
  console.log('\x1b[35m%s\x1b[0m', `Waiting ${minutes} minute(s) to do stuffs again...`)
}

// Timer to execute the worker-process once per some minutes
workers.loop = function(minutes){
  setInterval(function(){
    workers.importCurrencyValue()
    workers.whenAgain(minutes)
  },1000 * 60 * minutes)
}

// Init script
workers.init = function(){
  const minutes = process.env.WORKER_MINUTES || 2
  // Send to console, in yellow
  console.log('\x1b[33m%s\x1b[0m','🤖 Background workers are running 🤖')

  // Do the thing
  workers.importCurrencyValue()

  // When is going to happen again?
  workers.whenAgain(minutes)

  // Call the loop to keep doing things
  workers.loop(minutes)

}


// Export the module
export default workers
