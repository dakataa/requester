import AppendParameterTo from "@src/enum/AppendParameterTo";
import AbstractAuthorization from "@src/component/authorization/AbstractAuthorization";

// btoa only accepts Latin-1, so credentials are converted to UTF-8 bytes first.
const encodeBase64 = (value: string): string => btoa(
    encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
);

class BasicAuth extends AbstractAuthorization {

    appendTo: AppendParameterTo = AppendParameterTo.Header;

    username: string;
    password: string;

    constructor(username: string, password: string) {
        super();
        this.username = username;
        this.password = password;
    }

    getHeaders(): { [key: string]: string } {
        return {
            Authorization: 'Basic ' + encodeBase64(this.username + ':' + this.password)
        };
    }

}


export default BasicAuth;
