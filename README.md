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

## Presigned URL 얻어오기

[Lambda](./lambda-get-upload-url/index.js)에서는 getSignedUrlPromise()을 통해 presigned url을 얻어옵니다. 이때, client에서 전달받은 업로드할 파일에 대한 filename과 content type을 이용합니다.

```java
let filename = event['filename'];
let contentType = event['contentType'];

const s3Params = {
    Bucket: bucketName,
    Key: s3_prefix + '/' + filename,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType: contentType,
}

const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params);
console.log('uploadURL: ', uploadURL);

const response = {
    statusCode: 200,
    body: JSON.stringify({
        Bucket: bucketName,
        Key: s3_prefix + '/' + filename,
        Expires: URL_EXPIRATION_SECONDS,
        ContentType: contentType,
        UploadURL: uploadURL
    })
};
return response;
```

## 파일 업로드

[chat.js](./html/chat.js)와 같이 파일 업로드 요청시에 filename과 ext를 분리한 후에 아래와 같이 content-type을 정의합니다. '/getUploadUrl'로 filename, ext를 전송하면, presigned url을 응답으로 얻을 수 있습니다. 이후 HTTP PUT 방식으로 파일을 전송합니다. 

```java
$(document).ready(function () {
    input.change(function (evt) {
        var input = this;
        var url_file = $(this).val();
        var ext = url_file.substring(url_file.lastIndexOf('.') + 1).toLowerCase();
        var filename = url_file.substring(url_file.lastIndexOf('\\') + 1).toLowerCase();

        console.log('url: ' + url_file);
        console.log('filename: ' + filename);
        console.log('ext: ' + ext);

        if(ext == 'pdf') {
            contentType = 'application/pdf'           
        }
        else if(ext == 'txt') {
            contentType = 'text/plain'
        }
        else if(ext == 'csv') {
            contentType = 'text/csv'
        }

        const uri = "getUploadUrl";
        const xhr = new XMLHttpRequest();

        xhr.open("POST", uri, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                response = JSON.parse(xhr.responseText);
                console.log("response: " + JSON.stringify(response));

                // upload the file
                const body = JSON.parse(response.body);
                console.log('body: ', body);

                const UploadURL = body.UploadURL;
                console.log("UploadURL: ", UploadURL);

                var xmlHttp = new XMLHttpRequest();
                xmlHttp.open("PUT", UploadURL, true);

                let formData = new FormData();
                formData.append("attachFile", input.files[0]);
                console.log('uploading file info: ', formData.get("attachFile"));

                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == XMLHttpRequest.DONE && xmlHttp.status == 200) {
                        console.log(xmlHttp.responseText);
                    }
                    else if (xmlHttp.status != 200) {
                        console.log('status' + xmlHttp.status);
                        alert("Try again! The request was failed. Note the size of file should be less than 5MB");
                    }
                };

                xmlHttp.send(formData);
                console.log(xmlHttp.responseText);
            }
        };

        var requestObj = {
            "filename": filename,
            "ext": contentType,
        }
        console.log("request: " + JSON.stringify(requestObj));

        var blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

        xhr.send(blob);
    });
});
```


## Reference 

[S3 presigned URLs with SAM, auth and sample frontend](https://github.com/aws-samples/amazon-s3-presigned-urls-aws-sam/tree/master)

