enum RequestBodyType {
    FormData = 'form-data',
    Urlencoded = 'x-www-form-urlencoded',
    JSON = 'raw-json',
    Text = 'raw-text',
    Xml = 'raw-xml',
    Html = 'raw-html',
    Javascript = 'raw-javascript',
    Binary = 'binary'
}

const RequestBodyTypeHeaders: { [key: string]: { [key: string]: string } } = {
    [RequestBodyType.FormData]: {
    },
    [RequestBodyType.Urlencoded]: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    [RequestBodyType.JSON]: {
        'Content-Type': 'application/json'
    },
    [RequestBodyType.Text]: {
        'Content-Type': 'text/plain'
    },
    [RequestBodyType.Html]: {
        'Content-Type': 'text/html'
    },
    [RequestBodyType.Xml]: {
        'Content-Type': 'text/xml'
    },
    [RequestBodyType.Javascript]: {
        'Content-Type': 'text/javascript'
    },
    [RequestBodyType.Binary]: {
        'Content-Type': 'application/octet-stream'
    }
};

export {RequestBodyTypeHeaders};

export default RequestBodyType
