'use strict'

const Fastify = require('fastify')
const fastifyPrettier = require('./src/index')
const fs = require('fs')
const xml2js = require('xml2js')

const generateServer = async pluginOpts => {
  const fastify = new Fastify()

  await fastify.register(fastifyPrettier, pluginOpts)

  return fastify
}

// test cases

// eslint-disable-next-line
test('prettify empty response', async done => {
  const fastify = await generateServer()

  fastify.get('/', (req, reply) => {
    reply.send()
  })

  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(res.payload).toBe('')
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('prettify empty string response', async done => {
  const fastify = await generateServer()

  fastify.get('/', (req, reply) => {
    reply.send('')
  })

  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(res.payload).toBe('')
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('prettify json response', async done => {
  const fastify = await generateServer()

  fastify.get('/', (req, reply) => {
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    reply.send(obj)
  })

  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload)
      ).toBe(true)
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('buffer response returned as it is', async done => {
  const fastify = await generateServer()

  fastify.get('/', (req, reply) => {
    fs.readFile('test.json', (err, fileBuffer) => {
      reply.send(err || fileBuffer)
    })
  })

  fastify.inject(
    { method: 'GET', url: '/' },
    // eslint-disable-next-line
    (err1, res1) => {
      fastify.inject(
        { method: 'GET', url: '/?pretty=true' },
        // eslint-disable-next-line
        (err2, res2) => {
          // eslint-disable-next-line
          expect(res2.payload).toBe(res1.payload)
          done()

          fastify.close()
        }
      )
    }
  )
})

// eslint-disable-next-line
test('stream response returned as it is', async done => {
  const fastify = await generateServer()

  fastify.get('/', (req, reply) => {
    const stream = fs.createReadStream('test.json', 'utf8')
    reply.send(stream)
  })

  fastify.inject(
    { method: 'GET', url: '/' },
    // eslint-disable-next-line
    (err1, res1) => {
      fastify.inject(
        { method: 'GET', url: '/?pretty=true' },
        // eslint-disable-next-line
        (err2, res2) => {
          // eslint-disable-next-line
          expect(res2.payload).toBe(res1.payload)
          done()

          fastify.close()
        }
      )
    }
  )
})

// eslint-disable-next-line
test('prettify html response', async done => {
  const fastify = await generateServer({
    prettierOpts: {
      parser: 'html',
      htmlWhitespaceSensitivity: 'ignore'
    }
  })

  fastify.get('/', (req, reply) => {
    const obj = {
      test: true,
      format: 'html'
    }

    // generate xml
    const response = (new xml2js.Builder({ headless: true, renderOpts: false })).buildObject(obj)

    // set return type
    reply.type('text/html')

    reply.send(response)
  })

  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /<root>\n\s\s<test>true<\/test>\n\s\s<format>html<\/format>\n<\/root>/gi.test(res.payload)
      ).toBe(true)
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('prettify html response (by using decorator)', async done => {
  const fastify = await generateServer()

  fastify.get('/', (req, reply) => {
    const obj = {
      test: true,
      format: 'html'
    }

    const response = fastify.prettier(
      (new xml2js.Builder({ headless: true, renderOpts: false })).buildObject(obj),
      { parser: 'html', htmlWhitespaceSensitivity: 'ignore' }
    )

    // set return type
    reply.type('text/html')

    reply.send(response)
  })

  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /<root>\n\s\s<test>true<\/test>\n\s\s<format>html<\/format>\n<\/root>/gi.test(res.payload)
      ).toBe(true)
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('prettify error response', async done => {
  const fastify = await generateServer()

  fastify.inject(
    { method: 'GET', url: '/error?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /\{\n\s\s"message":\s"Route GET:\/error\?pretty=true\snot\sfound",\n\s\s"error":\s"Not\sFound",\n\s\s"statusCode":\s404\n\}/gi.test(res.payload)
      ).toBe(true)
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('non-prettified response', async done => {
  const fastify = await generateServer()

  fastify.get('/', (req, reply) => {
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    reply.send(obj)
  })

  fastify.inject(
    { method: 'GET', url: '/' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(res.payload).toBe('{"test":true,"format":"json"}')
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('alwaysOn option of the plugin active', async done => {
  const fastify = await generateServer({ alwaysOn: true })

  fastify.get('/', (req, reply) => {
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    reply.send(obj)
  })

  fastify.inject(
    { method: 'GET', url: '/' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload)
      ).toBe(true)
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('alwaysOn option of the plugin passive', async done => {
  const fastify = await generateServer({ alwaysOn: false })

  fastify.get('/', (req, reply) => {
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    reply.send(obj)
  })

  fastify.inject(
    { method: 'GET', url: '/' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        !(/\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload))
      ).toBe(true)
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('query option of the plugin active', async done => {
  const fastify = await generateServer(
    {
      query: {
        name: 'beautify',
        value: 'yes'
      }
    }
  )

  fastify.get('/', (req, reply) => {
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    reply.send(obj)
  })

  fastify.inject(
    { method: 'GET', url: '/?beautify=yes' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload)
      ).toBe(true)
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('query option of the plugin passive', async done => {
  const fastify = await generateServer(
    { query: false }
  )

  fastify.get('/', (req, reply) => {
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    reply.send(obj)
  })

  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        !(/\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload))
      ).toBe(true)
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('overrideContentLength option of the plugin active', async done => {
  const fastify = await generateServer(
    { overrideContentLength: true }
  )

  fastify.get('/', async (req, reply) => {
    const obj = {
      test: true,
      format: 'json'
    }

    // throw an error in async handler
    reply.type('application/json')

    // send response by throwing an error in async handler
    reply.send(obj.exception.throw())
  })

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

          fastify.close()
        }
      )
    }
  )
})

// eslint-disable-next-line
test('overrideContentLength option of the plugin passive', async done => {
  const fastify = await generateServer(
    { overrideContentLength: false }
  )

  fastify.get('/', async (req, reply) => {
    const obj = {
      test: true,
      format: 'json'
    }

    // throw an error in async handler
    reply.type('application/json')

    // send response by throwing an error in async handler
    reply.send(obj.exception.throw())
  })

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

          fastify.close()
        }
      )
    }
  )
})

// eslint-disable-next-line
test('enableOnSendHook option of the plugin active', async done => {
  const fastify = await generateServer(
    { enableOnSendHook: true }
  )

  fastify.get('/', (req, reply) => {
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    reply.send(obj)
  })

  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(
        /\{\n\s\s"test":\strue,\n\s\s"format":\s"json"\n\}/gi.test(res.payload)
      ).toBe(true)
      done()

      fastify.close()
    }
  )
})

// eslint-disable-next-line
test('enableOnSendHook option of the plugin passive', async done => {
  const fastify = await generateServer(
    { enableOnSendHook: false }
  )

  fastify.get('/', (req, reply) => {
    const obj = {
      test: true,
      format: 'json'
    }

    // set return type
    reply.type('application/json')

    reply.send(obj)
  })

  fastify.inject(
    { method: 'GET', url: '/?pretty=true' },
    // eslint-disable-next-line
    (err, res) => {
      // eslint-disable-next-line
      expect(res.payload).toBe('{"test":true,"format":"json"}')
      done()

      fastify.close()
    }
  )
})
