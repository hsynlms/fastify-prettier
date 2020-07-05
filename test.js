'use strict'

// get required node modules
const Fastify = require('fastify')
const fastifyPrettier = require('./src/index')
const xml2js = require('xml2js')

// fastify server generator
const generateServer = (pluginOpts) => {
  // initialize fastify server
  const fastify = new Fastify()

  // register the plugin
  fastify.register(fastifyPrettier, pluginOpts)

  // return the instance
  return fastify
}

// test cases

// eslint-disable-next-line
test('prettify empty response', done => {
  // initialize a fastify server
  const fastify = generateServer()

  // define a route
  fastify.get('/', (req, reply) => {
    // send response
    reply.send()
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(res.payload).toBe('')
      done()

      // close fastify server
      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('prettify empty string response', done => {
  // initialize a fastify server
  const fastify = generateServer()

  // define a route
  fastify.get('/', (req, reply) => {
    // send response
    reply.send('')
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(res.payload).toBe('')
      done()

      // close fastify server
      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('prettify json response', done => {
  // initialize a fastify server
  const fastify = generateServer()

  // define a route
  fastify.get('/', (req, reply) => {
    // variable definition
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    // send response
    reply.send(obj)
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload)
      ).toBe(true)
      done()

      // close fastify server
      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('prettify html response (by using decorator)', done => {
  // initialize a fastify server
  const fastify = generateServer()

  // define a route
  fastify.get('/', (req, reply) => {
    // variable definition
    const obj = {
      test: true,
      format: 'html'
    }

    // use prettier decorator
    const response = fastify.prettier(
      (new xml2js.Builder({ headless: true, renderOpts: false })).buildObject(obj),
      // override prettier options
      { parser: 'html', htmlWhitespaceSensitivity: 'ignore' }
    )

    // set return type
    reply.type('text/html')

    // send response
    reply.send(response)
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /<root>\n\s\s<test>true<\/test>\n\s\s<format>html<\/format>\n<\/root>/gi.test(res.payload)
      ).toBe(true)
      done()

      // close fastify server
      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('prettify error response', done => {
  // initialize a fastify server
  const fastify = generateServer()

  // test
  fastify.inject(
    { method: 'GET', url: '/error?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /\{\n\s\s"message":\s"Route GET:\/error\?pretty=true\snot\sfound",\n\s\s"error":\s"Not\sFound",\n\s\s"statusCode":\s404\n\}/gi.test(res.payload)
      ).toBe(true)
      done()

      // close fastify server
      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('non-prettified response', done => {
  // initialize a fastify server
  const fastify = generateServer()

  // define a route
  fastify.get('/', (req, reply) => {
    // variable definition
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    // send response
    reply.send(obj)
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(res.payload).toBe('{"test":true,"format":"json"}')
      done()

      // close fastify server
      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('alwaysOn option of the plugin active', done => {
  // initialize a fastify server
  const fastify = generateServer({ alwaysOn: true })

  // define a route
  fastify.get('/', (req, reply) => {
    // variable definition
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    // send response
    reply.send(obj)
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload)
      ).toBe(true)
      done()

      // close fastify server
      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('alwaysOn option of the plugin passive', done => {
  // initialize a fastify server
  const fastify = generateServer({ alwaysOn: false })

  // define a route
  fastify.get('/', (req, reply) => {
    // variable definition
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    // send response
    reply.send(obj)
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        !(/\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload))
      ).toBe(true)
      done()

      // close fastify server
      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('query option of the plugin active', done => {
  // initialize a fastify server
  const fastify = generateServer(
    {
      query: {
        name: 'beautify',
        value: 'yes'
      }
    }
  )

  // define a route
  fastify.get('/', (req, reply) => {
    // variable definition
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    // send response
    reply.send(obj)
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/?beautify=yes' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload)
      ).toBe(true)
      done()

      // close fastify server
      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('query option of the plugin passive', done => {
  // initialize a fastify server
  const fastify = generateServer(
    { query: false }
  )

  // define a route
  fastify.get('/', (req, reply) => {
    // variable definition
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    // send response
    reply.send(obj)
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        !(/\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload))
      ).toBe(true)
      done()

      // close fastify server
      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('overrideContentLength option of the plugin active', done => {
  // initialize a fastify server
  const fastify = generateServer(
    { overrideContentLength: true }
  )

  // define a route
  fastify.get('/', async (req, reply) => {
    // variable definition
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    // send response by throwing an error in async handler
    reply.send(obj.exception.throw())
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/' },
    // eslint-disable-next-line
    (err1, res1) => {
      fastify.inject(
        { method: 'GET', url: '/?pretty=true' },
        // eslint-disable-next-line
        (err2, res2) => {
          // eslint-disable-next-line
          expect(
            res2.headers['content-length'] - res1.headers['content-length'] === 14
          ).toBe(true)
          done()

          // close fastify server
          fastify.close()
        }
      )
    }
  )
})

// eslint-disable-next-line
test('overrideContentLength option of the plugin passive', done => {
  // initialize a fastify server
  const fastify = generateServer(
    { overrideContentLength: false }
  )

  // define a route
  fastify.get('/', async (req, reply) => {
    // variable definition
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    // send response by throwing an error in async handler
    reply.send(obj.exception.throw())
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/' },
    // eslint-disable-next-line
    (err1, res1) => {
      fastify.inject(
        { method: 'GET', url: '/?pretty=true' },
        // eslint-disable-next-line
        (err2, res2) => {
          // eslint-disable-next-line
          expect(
            res2.headers['content-length'] === res1.headers['content-length']
          ).toBe(true)
          done()

          // close fastify server
          fastify.close()
        }
      )
    }
  )
})

// eslint-disable-next-line
test('enableOnSendHook option of the plugin active', done => {
  // initialize a fastify server
  const fastify = generateServer(
    { enableOnSendHook: true }
  )

  // define a route
  fastify.get('/', async (req, reply) => {
    // variable definition
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    // send response
    reply.send(obj)
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload)
      ).toBe(true)
      done()

      // close fastify server
      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('enableOnSendHook option of the plugin passive', done => {
  // initialize a fastify server
  const fastify = generateServer(
    { enableOnSendHook: false }
  )

  // define a route
  fastify.get('/', async (req, reply) => {
    // variable definition
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    // send response
    reply.send(obj)
  })

  // test
  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(res.payload).toBe('{"test":true,"format":"json"}')
      done()

      // close fastify server
      fastify.close()
    }
  )
})
