const AWS = require('aws-sdk')
const config = require('config')

const SNS = (options = {}) => new AWS.SNS(Object.assign({}, config.sns.options, options))
const SQS = (options = {}) => new AWS.SQS(Object.assign({}, config.sqs.options, options))

module.exports = {
  SNS,
  SQS,
}
