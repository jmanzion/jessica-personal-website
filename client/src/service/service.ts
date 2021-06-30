export class Service {
    sendRequest(apiEndpoint: string, methodType: string, requestPayload: Object | null = null): Promise<Object> {
      return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open(methodType, apiEndpoint, true);
        req.onload = () => {
          if (req.status >= 200 && req.status < 300) {
            resolve(JSON.parse(req.responseText));
          } else {
            reject({
              status: req.status,
              statusText: req.statusText
            });
          }
        };
        req.onerror = () => {
          reject({
            status: req.status,
            statusText: req.statusText
          });
        }
        if (requestPayload) {
          //req.setRequestHeader('Content-Type', 'multipart/form-data');
          req.send(JSON.stringify(requestPayload));
        } else {
          req.send();
        };
      });
    }
  }