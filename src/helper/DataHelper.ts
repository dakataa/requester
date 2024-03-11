import StandardObjectType from "@src/type/StandardObjectType";
import standardObjectType from "@src/type/StandardObjectType";

const convertFormDataToObject = (formData: FormData): StandardObjectType => {
    let data: StandardObjectType = {};
    formData.forEach((value, originalKey) => {
        const keys = originalKey.match(/\w+/gi)
        const lastKey = Object.create(keys).pop();
        let nested = data;
        (keys || []).forEach((key) => {
            if (key === lastKey) {
                nested[key] = originalKey.match(/\[]$/i) ? Object.assign(nested[key] ?? [], [value]) : value;
            } else {
                nested[key] = (nested[key] || {});
                nested = nested[key];
            }
        });
    });

    return data;
};

const convertObjectToFormData = (data: StandardObjectType, formData?: FormData, parentKeys?: string[]): FormData => {
    formData = formData || new FormData();

    for (let key in data) {
        const value: any = data[key];
        const keyPath = [...(parentKeys || []), key];
        if (value instanceof Object) {
            formData = convertObjectToFormData(value, formData, keyPath);
            continue;
        }

        const formKey = keyPath.shift() + keyPath.map(k => '[' + k + ']').join('');
        formData.set(formKey, value);
    }

    return formData;
}

const convertObjectToURLSearchParams = (data: StandardObjectType): URLSearchParams => {
    const formData = convertObjectToFormData(data);
    return new URLSearchParams(Object.fromEntries(formData.entries()) as standardObjectType)
}


export {convertFormDataToObject, convertObjectToFormData, convertObjectToURLSearchParams};
