# SNS-SQS Mock

AWS の SNS と SQS の mock 環境です。

localstack は事前に topic/queue 定義ができないため使っていません。

- SNS: https://github.com/s12v/sns
- SQS: https://github.com/adamw/elasticmq

## 環境

- [必須] docker-compose (ver3 以上)が動く環境
- [任意] node.js が動く環境
  - version は aws で動くバージョンだと問題ないはず

## 準備

### docker 環境

```
$ cd sns-sqs/mock
$ docker-compose up -d
```

次のポートを使用しています.

- 9911: SNS のポート
- 9324: SQS のポート

### サンプル用プログラム

```
$ cd sns-sqs
$ npm install
```

## 実行

### aws-cli での操作例
--endpoint-url を指定して下さい。

```
$ aws sns --endpoint-url=http://localhost:9911 list-topics
$ aws sns --endpoint-url=http://localhost:9911 publish --topic-arn=arn:aws:sns:us-east-1:0000000000000:topic1 --message="Hello World"

$ aws sqs --endpoint-url=http://localhost:9324 list-queues
$ aws sqs --endpoint-url=http://localhost:9324 receive-message --queue-url=http://localhost:9324/queue/subscribe-topic1
```

### サンプル用プログラム

#### mock の Topic と Queue 一覧表示

```
$ npm start
```

#### SES バウンス通知メッセージ mock

[Amazon SES の Amazon SNS 通知のコンテンツ](https://docs.aws.amazon.com/ja_jp/ses/latest/DeveloperGuide/notification-contents.html)で、Bounce が発生した時の通知をシミュレートします。

```
$ npm run bounce \
  --from <s>           // [必須]from address
  --to <s>             // [必須]to address(bounced address)
  --type <s>           // [任意]BounceType(Permanent/Undetermined/Transient) (default: Undetermined)
  --subtype <s>        // [任意]BounceSubType(Undetermined/General/NoEmail/...) (default: Undetermined)
  --topic-region <s>   // [任意]SNS topic region (default: us-east-1)
  --topic-account <s>  // [任意]SNS topic account (default: 0000000000000)
  --topic-name <s>     // [任意]SNS topic name (default: topic1)
# 実行例
$ npm run bounce --from=from@example.com --to=bounced@example.com
```

## 設定

### SNS と SQS

#### SNS

事前に SNS の Topic を作成する場合は、mock/config/db.json を編集して下さい。  
定義内容は https://github.com/s12v/sns/blob/master/example/config/db.json を参考にして下さい。  
mock には「topic1」「topic2」の 2 つの topic が定義されています。

#### SQS

事前に SQS の queue を作成する場合は、mock/config/elasticmq.conf を編集して下さい。  
定義内容は[Automatically creating queues on startup](https://github.com/adamw/elasticmq#automatically-creating-queues-on-startup)を参考にして下さい。
mock には「subscribe-topic1」「receive-queue1」「receive-queue1-DLQ」の 3 つの queue が定義されています。

- topic1 -> subscribe-topic1
- topic2 -> receive-queue1 -> receive-queue1-DLQ(dead letter queue)
