'use strict'

const fastifyPlugin = require('fastify-plugin')
const prettier = require('prettier')
const isStream = require('is-stream')
const pkg = require('../package.json')

const defaults = {
  decorator: 'prettier',
  query: {
    name: 'pretty',
    value: 'true'
  },
  alwaysOn: false,
  fallbackOnError: true,
  enableOnSendHook: true,
  overrideContentLength: true,
  prettierOpts: {
    tabWidth: 2,
    parser: 'json-stringify'
  }
}

function prettierPlugin (fastify, opts, done) {
  const options = Object.assign({}, defaults, opts)

  // amazer :)
  const amazeMe = (content, opts) => {
    let strContent = ''

    if (typeof content === 'function') {
      throw Error(`${pkg.name} cannot beautify 'function' type objects`)
    } else if (typeof content === 'object' || Array.isArray(content)) {
      strContent = JSON.stringify(content)
    } else {
      strContent = content.toString()
    }

    return prettier.format(
      strContent,
      Object.assign({}, options.prettierOpts, opts)
    )
  }

  fastify.decorate(options.decorator, amazeMe)

  // get injected into 'onSend' hook to be able to beautify the payload
  // if its enabled in options
  if (options.enableOnSendHook === true) {
    fastify.addHook('onSend', async (req, reply, payload) => {
      // if the payload which is being sent is a stream or a buffer
      // return the original payload
      if (isStream(payload) || Buffer.isBuffer(payload)) return payload

      // set current payload as fallback
      let prettifiedPayload = payload

      let isPrettified = false

      if (options.alwaysOn === true ||
          // eslint-disable-next-line
          (options.query && req.query[options.query.name] == options.query.value)) {
        try {
          // format the payload
          prettifiedPayload = amazeMe(prettifiedPayload)

          isPrettified = true
        } catch (err) {
          if (options.fallbackOnError === false) {
            // throw the error if fallback is disabled
            throw Error(`${pkg.name} run into an unexpected error: ${err.message}`)
          }
        }
      }

      // reset content-length header with new payload length
      // if its enabled in options
      if (isPrettified &&
          prettifiedPayload &&
          options.overrideContentLength === true) {
        reply.header('content-length', prettifiedPayload.length)
      }

      return prettifiedPayload
    })
  }

  done()
}

module.exports = fastifyPlugin(
  prettierPlugin,
  {
    fastify: '3.x',
    name: pkg.name
  }
)
