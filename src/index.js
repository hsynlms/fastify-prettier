'use strict'

// get required modules
const fastifyPlugin = require('fastify-plugin')
const prettier = require('prettier')
const pkg = require('../package.json')

// options defaults
const defaults = {
  decorator: 'prettier',
  parser: 'json-stringify',
  query: {
    name: 'pretty',
    value: 'true'
  },
  alwaysOn: false,
  spaces: 2,
  fallbackOnError: true
}

// declaration of prettier plugin for fastify
function prettierPlugin (fastify, opts, done) {
  // combine defaults with provided options
  const options = Object.assign({}, defaults, opts)

  // amazer :)
  const amazeMe = async (content, parser) => {
    // declaration of stringified content
    let strContent = ''

    // validations
    if (typeof content === 'function') {
      throw Error(`${pkg.name} cannot beautify 'function' type objects`)
    } else if (typeof content === 'object' || Array.isArray(content)) {
      strContent = JSON.stringify(content)
    } else {
      strContent = content.toString()
    }

    // return amazed result
    return await Promise.resolve(
      prettier.format(strContent, {
        tabWidth: options.spaces,
        parser: parser || options.parser
      })
    )
  }

  // register the amazer as a decorator as well
  fastify.decorate(options.decorator, amazeMe)

  // get injected into 'onSend' hook to be able to beautify the payload
  fastify.addHook('onSend', async (request, reply, payload, done) => {
    // new payload variable declaration
    // set current payload as fallback
    let prettifiedPayload = payload

    if (options.alwaysOn === true ||
        // eslint-disable-next-line
        (options.query && request.query[options.query.name] == options.query.value)) {
      try {
        // format the payload
        prettifiedPayload = await amazeMe(prettifiedPayload)
      } catch (err) {
        // something bad happened
        if (options.fallbackOnError === false) {
          // throw the error if fallback is disabled
          throw Error(`${pkg.name} run into an unexpected error: ${err.message}`)
        }
      }
    }

    // done, sent back the new payload
    return prettifiedPayload
  })

  // done
  done()
}

// export the plugin
module.exports = fastifyPlugin(
  prettierPlugin,
  {
    fastify: '2.x',
    name: pkg.name
  }
)
