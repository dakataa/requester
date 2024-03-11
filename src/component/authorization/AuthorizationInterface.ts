import AppendParameterTo from "@src/enum/AppendParameterTo";
import StandardObjectType from "@src/type/StandardObjectType";

interface AuthorizationInterface {
    appendTo: AppendParameterTo;

    getHeaders(): { [key: string]: string }

    getQuery(): StandardObjectType;

    getBody(): StandardObjectType;
}

export default AuthorizationInterface;
