import AppendParameterTo from "@src/enum/AppendParameterTo";
import appendParameterTo from "@src/enum/AppendParameterTo";
import AbstractAuthorization from "@src/component/authorization/AbstractAuthorization";

class BearerToken extends AbstractAuthorization {

    appendTo: AppendParameterTo = AppendParameterTo.Header;

    token: string;
    constructor(token: string) {
        super();
        this.token = token;
    }

    getHeaders(): { [p: string]: string | number } {
        return {
            Authorization: 'Bearer ' + this.token
        };
    }

}
