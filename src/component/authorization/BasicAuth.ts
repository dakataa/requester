import AppendParameterTo from "@src/enum/AppendParameterTo";
import AbstractAuthorization from "@src/component/authorization/AbstractAuthorization";

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
            Authorization: atob(this.username + ':' + this.password)
        };
    }

}


export default BasicAuth;
