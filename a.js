$(document).ready(function() {
    input.change(function(evt) {
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

        const uri = "getUploadUrl";
        const xhr = new XMLHttpRequest();
    
        xhr.open("POST", uri, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                response = JSON.parse(xhr.responseText);
                console.log("response: " + JSON.stringify(response));
                
                // addReceivedMessage(response.UploadURL)

                // upload the file
                const body = JSON.parse(response.body);
                console.log('body: ', body);

                const UploadURL = body.UploadURL;                    
                console.log("UploadURL: ", UploadURL);

                var xmlHttp = new XMLHttpRequest();
                xmlHttp.open("PUT", UploadURL, true);       

                let formData = new FormData();
                formData.append("attachFile" , input.files[0]);
                console.log('uploading file info: ', formData.get("attachFile"));

                xmlHttp.onreadystatechange = function() {
                    if (xmlHttp.readyState == XMLHttpRequest.DONE && xmlHttp.status == 200 ) {
                        console.log(xmlHttp.responseText);
                    }
                    else if(xmlHttp.status != 200) {
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
    
        var blob = new Blob([JSON.stringify(requestObj)], {type: 'application/json'});
    
        xhr.send(blob);            
    });
});
