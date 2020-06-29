// get required node modules
const fastify = require('fastify')()
const fastifyPrettier = require('./src/index')
const chalk = require('chalk')

// defaults
const defaults = { port: 3000 }

// register the plugin
fastify.register(fastifyPrettier)

// register test route
fastify.get('/', (request, reply) => {
  // create an object
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

  // return the object
  reply.send(obj)
})

// initialize the fastify server
fastify.listen(defaults.port, () => {
  console.log(
    chalk.bgYellow(
      chalk.black(`Fastify server is running on port: ${defaults.port}`)
    )
  )
})
