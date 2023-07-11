# Serverless POC

## Deployment

```
sls deploy
```

## Withdrawl deployment

```
sls remove
```

## Steps to do before Deployment

### Set Environment variables for serverless.yaml

```
environment:
    SOURCE_EMAIL: 'name@domain.com'
    SQS_QUEUE_URL: 'https://sqs.<region>.amazonaws.com/<accountId>/<queue-name>'
```

### Replacing ARN for sendEmail lambda function in serverless.yaml

```
sendEmail:
    handler: src/handlers/sendEmail.sendEmail
    events:
      - sqs:
          arn: <Paste SQS ARN>
```

### Verify Source Email Address in the SES configuration

### Add DynamoDBFull Access, SES Full Access and SQS Full Access to Role Created from Serverless Configuration in the Role Manager (IAM)
