import AppendParameterTo from "@src/enum/AppendParameterTo";
import AbstractAuthorization from "@src/component/authorization/AbstractAuthorization";

class APIKey extends AbstractAuthorization {

    appendTo: AppendParameterTo;
    key: string;
    value: string;

    constructor(key: string = 'X-Api-Key', value: string, appendTo: AppendParameterTo) {
        super();

        this.key = key;
        this.value = value;

        this.appendTo = appendTo;
    }

    getHeaders(): { [p: string]: string | number } {
        if(this.appendTo === AppendParameterTo.Header) {
            return {
                [this.key]: this.value
            };
        }

        return super.getHeaders();
    }

    getQuery(): { [p: string]: string | number } {
        if(this.appendTo === AppendParameterTo.Query) {
            return {
                [this.key]: this.value
            };
        }

        return this.getBody();
    }
}
