# Serverless POC

<b><i> Node Version v16.16.0 & Serverless Framework v3.33.0 </i></b>

## Deployment

```
sls deploy
```

## Withdrawl deployment

```
sls remove
```

## Steps to do before Deployment

### 1. Set Environment variables for serverless.yaml

```
environment:
    SOURCE_EMAIL: 'name@domain.com'
    SQS_QUEUE_URL: 'https://sqs.<region>.amazonaws.com/<accountId>/<queue-name>'
    BUCKET_NAME: 'test-serverless-prabha'
```

### 2. Replacing ARN for sendEmail lambda function in serverless.yaml

```
sendEmail:
    handler: src/handlers/sendEmail.sendEmail
    events:
      - sqs:
          arn: <Paste SQS ARN>
```

### 3. Verify Source Email Address in the SES configuration

### 4. Add DynamoDBFull Access, SES Full Access, S3 Full Access and SQS Full Access to Role Created from Serverless Configuration in the Role Manager (IAM)
