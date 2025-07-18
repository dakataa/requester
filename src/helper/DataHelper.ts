import StandardObjectType from "@src/type/StandardObjectType";

const convertFormDataToObject = (formData: FormData): StandardObjectType => {
    const data: StandardObjectType = {};
    formData.forEach(function (value, originalKey) {
        const keys = originalKey.match(/[\w-]+/gi) ?? [];
        if (!keys.length) {
            throw new Error('Invalid Form Data Key: ' + originalKey);
        }

        const lastKey = keys.pop();
        const isArray = originalKey.endsWith('[]');

        let nested: any = data;
        (keys || []).forEach(function (key) {
            nested[key] = {...(nested[key] ?? {})};
            nested = nested[key];
        });

        if (lastKey) {
            nested[lastKey] = isArray ? [...(nested[lastKey] ?? []), value] : value;
        }
    });

    return data;
};

const convertObjectToFormData = (data: StandardObjectType, formData?: FormData, parentKeys?: string[]): FormData => {
    formData = formData || new FormData();

    for (let key in data) {
        const value: any = data[key];
        const keyPath = [...(parentKeys || []), key];
        if (value instanceof Object && !(value instanceof File)) {
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
    return new URLSearchParams(Object.fromEntries(formData.entries()) as StandardObjectType)
}

const convertURLSearchParamsToObject = (searchData: URLSearchParams): object => {
    let data: object = {};
    searchData.forEach((value, originalKey) => {
        const keys = originalKey.match(/\w+/gi)
        const lastKey = Object.create(keys).pop();
        let nested:{[key: string]: any} = data;
        (keys || []).forEach((key) => {
            if (key === lastKey) {
                nested[key as keyof object] = originalKey.match(/\[]$/i) ? Object.assign(nested[key as keyof object] || [], [value]) : value;
            } else {
                nested[key as keyof object] = (nested[key as keyof object] || {});
                nested = nested[key as keyof object];
            }
        });
    });

    return data;
};

export {convertFormDataToObject, convertObjectToFormData, convertObjectToURLSearchParams, convertURLSearchParamsToObject};
