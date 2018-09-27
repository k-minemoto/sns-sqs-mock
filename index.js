const { SNS, SQS } = require('./sdk')
const sns = SNS()
const sqs = SQS()
const log = console.log

const displayTopicInfo = async () => {
  log('Topic Info:')
  const { Subscriptions } = await sns.listSubscriptions().promise()
  Subscriptions.forEach(subscription => log('  -', subscription, '\n'))
}

const displayQueueList = async () => {
  log('Queue Urls:')
  const { QueueUrls } = await sqs.listQueues().promise()
  QueueUrls.forEach(url => log('  -', url))
}

const main = async () => {
  await displayTopicInfo()
  await displayQueueList()
}

main().catch(e => {
  console.error(e)
})
