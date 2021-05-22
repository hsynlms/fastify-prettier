'use strict'

const fastify = require('fastify')()
const fastifyPrettier = require('./src/index')
const chalk = require('chalk')

const defaults = { port: 3000 }

;(async () => {
  await fastify.register(fastifyPrettier)

  fastify.get('/', (req, reply) => {
    const obj = {
      blackLivesMatter: true,
      favSinger: 'Ahmet Kaya',
      visitedCities: ['Mardin', 'Diyarbakır', 'Rome', 'Amsterdam', 'Istanbul', 'Kotor', 'Mostar', 'Belgrade'],
      pi: 3.14,
      games: {
        rdr2: 'completed',
        gtfo: 'continues'
      }
    }

    // set return type
    reply.type('application/json')

    reply.send(obj)
  })

  fastify.listen(defaults.port, () => {
    console.log(
      chalk.bgYellow(
        chalk.black(`Fastify server is running on port: ${defaults.port}`)
      )
    )
  })
})()
