import AppendParameterTo from "@src/enum/AppendParameterTo";
import AuthorizationInterface from "@src/component/authorization/AuthorizationInterface";
import StandardObjectType from "@src/type/StandardObjectType";

abstract class AbstractAuthorization implements AuthorizationInterface {
    abstract appendTo: AppendParameterTo;

    getBody(): StandardObjectType {
        return {};
    }

    getHeaders(): { [key: string]: string } {
        return {};
    }

    getQuery(): StandardObjectType {
        return {};
    }

}

export default AbstractAuthorization;
