const aws = require('aws-sdk');
const {v4: uuidv4} = require('uuid');

const s3 = new aws.S3();

const bucketName = process.env.bucketName;
const s3_prefix = process.env.s3_prefix;

const URL_EXPIRATION_SECONDS = 300

exports.handler = async (event, context) => {
    //console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    //console.log('## EVENT: ' + JSON.stringify(event));
    
    const body = Buffer.from(event["body"], "base64");
    console.log('body: ' + body);
    const header = event['multiValueHeaders'];
    console.log('header: ' + JSON.stringify(header));
            
    let contentType = 'application/pdf';
    if(header['Content-Type']) {
        contentType = String(header['Content-Type']);
    }
    else if(header['content-type']) {
        contentType = String(header['content-type']);
    } 
    console.log('contentType = '+contentType); 

    let contentDisposition="";
    if(header['Content-Disposition']) {
        contentDisposition = String(header['Content-Disposition']);  
    } 
    console.log('disposition = '+contentDisposition);
    
    let filename = "";
    const uuid = uuidv4();   

    if(contentType == 'application/pdf') {
        filename = uuid+'.pdf';
    }
    else if(contentType == 'text/plain') {
        filename = uuid+'.txt';
    }
    else if(contentType == 'text/csv') {
        filename = uuid+'.csv';
    }
    else {
        filename = uuid+'.unknown';
    }
    console.log('filename = '+filename);

    const s3Params = {
        Bucket: bucketName,
        Key: s3_prefix+'/'+filename,
        Expires: URL_EXPIRATION_SECONDS,
        ContentType: contentType,
    }

    const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params);
    console.log('uploadURL: ', uploadURL);

    const response = {
        statusCode: 200,
        uploadURL: JSON.stringify({
            Bucket: bucketName,
            Key: s3_prefix+'/'+filename,
            Expires: URL_EXPIRATION_SECONDS,
            ContentType: contentType,
            UploadURL: uploadURL
        })
    };
    return response;
};