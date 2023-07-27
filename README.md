# Amazon S3 Presigned Url을 이용하여 파일 업로드하기


## S3에 대한 CORS 설정

```java
[
   {
      "AllowedHeaders":[
         "*"
      ],
      "AllowedMethods":[
         "PUT",
         "POST"
      ],
      "AllowedOrigins":[
         "*"
      ],
      "ExposeHeaders":[
         
      ]
   }
]
```

## Reference 

[S3 presigned URLs with SAM, auth and sample frontend](https://github.com/aws-samples/amazon-s3-presigned-urls-aws-sam/tree/master)

