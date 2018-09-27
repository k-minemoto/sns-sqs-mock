const args = require('commander')
const { SNS } = require('./sdk')
const uuid = require('uuid/v1')
const log = console.log

const sns = SNS()

// https://docs.aws.amazon.com/ja_jp/ses/latest/DeveloperGuide/notification-contents.html
const bounceMessage = ({ from, to, type, subtype, topicRegion, topicAccount }) => {
  const timestamp = new Date().toISOString()
  return {
    notificationType: 'Bounce',
    bounce: {
      bounceType: type,
      bouncedRecipients: [
        {
          emailAddress: to,
        },
      ],
      bounceSubType: subtype,
      timestamp,
      feedbackId: uuid(),
      remoteMtaIp: '127.0.2.0',
    },
    mail: {
      timestamp,
      source: from,
      sourceArn: `arn:aws:ses:${topicRegion}:${topicAccount}:identity/${from.split('@')[1]}`,
      sourceIp: '127.0.0.1',
      sendingAccountId: topicAccount,
      messageId: uuid(),
      destination: [to],
    },
  }
}

const publish = async (message, { topicRegion, topicAccount, topicName }) => {
  const param = {
    TopicArn: `arn:aws:sns:${topicRegion}:${topicAccount}:${topicName}`,
    Message: JSON.stringify(message),
  }
  try {
    const result = await sns.publish(param).promise()
    log(result.MessageId)
  } catch (e) {
    log(e)
  }
}

/**
 * SESでバウンスが発生したかのようなメッセージをSNSに送信する.
 * <p>
 * バウンス発生時のメール本文は、SNSの通知には含まれずS3に格納される.
 * 通知のみの実験用mockなので、S3まではサポートしていない.
 * バリデーションは実装していないのでメアドやtype等に適当な値を入れても動くだろうが、
 * 意図した結果にはならないと思う.
 * </p>
 *
 * @param {*} argv
 */
const main = async argv => {
  const opts = args
    .option('--from <s>', 'from address', null)
    .option('--to <s>', 'to address(bounced address)', null)
    .option('--type <s>', 'BounceType(Permanent/Undetermined/Transient)', 'Undetermined')
    .option('--subtype <s>', 'BounceSubType(Undetermined/General/NoEmail/...)', 'Undetermined')
    .option('--topic-region <s>', 'SNS topic region', 'us-east-1')
    .option('--topic-account <s>', 'SNS topic account', '0000000000000')
    .option('--topic-name <s>', 'SNS topic name', 'topic1')
    .parse(argv)
  if (argv.length - 2 < 2) {
    args.help()
    return
  }
  await publish(bounceMessage(opts), opts)
}

main(process.argv)
