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
test('prettify empty response', done => {
  generateServer()
    .then(fastify => {
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
})

// eslint-disable-next-line
test('prettify empty string response', done => {
  generateServer()
    .then(fastify => {
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
})

// eslint-disable-next-line
test('prettify json response', done => {
  generateServer()
    .then(fastify => {
      fastify.get('/', (req, reply) => {
        const obj = {
          test: true,
          format: 'json'
        }

        reply
          .type('application/json')
          .send(obj)
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
})

// eslint-disable-next-line
test('buffer response returned as it is', done => {
  generateServer()
    .then(fastify => {
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
})

// eslint-disable-next-line
test('stream response returned as it is', done => {
  generateServer()
    .then(fastify => {
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
})

// eslint-disable-next-line
test('prettify html response', done => {
  generateServer({
    prettierOpts: {
      parser: 'html',
      htmlWhitespaceSensitivity: 'ignore'
    }
  })
    .then(fastify => {
      fastify.get('/', (req, reply) => {
        const obj = {
          test: true,
          format: 'html'
        }

        const response =
          (new xml2js.Builder({ headless: true, renderOpts: false })).buildObject(obj)

        reply
          .type('text/html')
          .send(response)
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
})

// eslint-disable-next-line
test('prettify html response (by using decorator)', done => {
  generateServer()
    .then(fastify => {
      fastify.get('/', (req, reply) => {
        const obj = {
          test: true,
          format: 'html'
        }

        const response = fastify.prettier(
          (new xml2js.Builder({ headless: true, renderOpts: false })).buildObject(obj),
          { parser: 'html', htmlWhitespaceSensitivity: 'ignore' }
        )

        reply
          .type('text/html')
          .send(response)
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
})

// eslint-disable-next-line
test('prettify error response', done => {
  generateServer()
    .then(fastify => {
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
})

// eslint-disable-next-line
test('non-prettified response', done => {
  generateServer()
    .then(fastify => {
      fastify.get('/', (req, reply) => {
        const obj = {
          test: true,
          format: 'json'
        }

        reply
          .type('application/json')
          .send(obj)
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
})

// eslint-disable-next-line
test('alwaysOn option of the plugin active', done => {
  generateServer({ alwaysOn: true })
    .then(fastify => {
      fastify.get('/', (req, reply) => {
        const obj = {
          test: true,
          format: 'json'
        }

        reply
          .type('application/json')
          .send(obj)
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
})

// eslint-disable-next-line
test('alwaysOn option of the plugin passive', done => {
  generateServer({ alwaysOn: false })
    .then(fastify => {
      fastify.get('/', (req, reply) => {
        const obj = {
          test: true,
          format: 'json'
        }

        reply
          .type('application/json')
          .send(obj)
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
})

// eslint-disable-next-line
test('query option of the plugin active', done => {
  generateServer(
    {
      query: {
        name: 'beautify',
        value: 'yes'
      }
    }
  )
    .then(fastify => {
      fastify.get('/', (req, reply) => {
        const obj = {
          test: true,
          format: 'json'
        }

        reply
          .type('application/json')
          .send(obj)
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
})

// eslint-disable-next-line
test('query option of the plugin passive', done => {
  generateServer({ query: false })
    .then(fastify => {
      fastify.get('/', (req, reply) => {
        const obj = {
          test: true,
          format: 'json'
        }

        reply
          .type('application/json')
          .send(obj)
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
})

// eslint-disable-next-line
test('overrideContentLength option of the plugin active', done => {
  generateServer(
    { overrideContentLength: true }
  )
    .then(fastify => {
      fastify.get('/', async (req, reply) => {
        const obj = {
          test: true,
          format: 'json'
        }

        // throw an error in async handler
        reply
          .type('application/json')
          .send(obj.exception.throw())
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
})

// eslint-disable-next-line
test('overrideContentLength option of the plugin passive', done => {
  generateServer(
    { overrideContentLength: false }
  )
    .then(fastify => {
      fastify.get('/', async (req, reply) => {
        const obj = {
          test: true,
          format: 'json'
        }

        // throw an error in async handler
        reply
          .type('application/json')
          .send(obj.exception.throw())
      })

      fastify.inject(
        { method: 'GET', url: '/' },
        // eslint-disable-next-line
        (err1, res1) => {
          fastify.inject(
            { method: 'GET', url: '/' },
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
})

// eslint-disable-next-line
test('enableOnSendHook option of the plugin active', done => {
  generateServer(
    { enableOnSendHook: true }
  )
    .then(fastify => {
      fastify.get('/', (req, reply) => {
        const obj = {
          test: true,
          format: 'json'
        }

        reply
          .type('application/json')
          .send(obj)
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
})

// eslint-disable-next-line
test('enableOnSendHook option of the plugin passive', done => {
  generateServer(
    { enableOnSendHook: false }
  )
    .then(fastify => {
      fastify.get('/', (req, reply) => {
        const obj = {
          test: true,
          format: 'json'
        }

        reply
          .type('application/json')
          .send(obj)
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
})
