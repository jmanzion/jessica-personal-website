export class Service {
    sendRequest(apiEndpoint: string, methodType: string, requestPayload: FormData | null): Promise<Object> {
      return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open(methodType, apiEndpoint, true);
        req.onload = () => {
          if (req.status >= 200 && req.status < 300) {
            resolve(req);
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
          req.send(requestPayload);
        } else {
          req.send();
        };
      });
    }
  }