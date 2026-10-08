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
            const hasValue = Object.prototype.hasOwnProperty.call(nested, lastKey);
            if (isArray || hasValue) {
                const previous = hasValue ? nested[lastKey] : [];
                nested[lastKey] = [...(Array.isArray(previous) ? previous : [previous]), value];
            } else {
                nested[lastKey] = value;
            }
        }
    });

    return data;
};

const convertObjectToFormData = (data: StandardObjectType, formData?: FormData, parentKeys?: string[]): FormData => {
    formData = formData || new FormData();

    for (let key in data) {
        const value: any = data[key];
        const keyPath = [...(parentKeys || []), key];
        if (value instanceof Object && !(typeof Blob !== 'undefined' && value instanceof Blob)) {
            formData = convertObjectToFormData(value, formData, keyPath);
            continue;
        }

        const formKey = keyPath.shift() + keyPath.map(k => '[' + k + ']').join('');
        formData.set(formKey, value);
    }

    return formData;
}

const convertObjectToURLSearchParams = (data: StandardObjectType): URLSearchParams => {
    const parameters = new URLSearchParams();
    const addValues = (value: any, key: string) => {
        if (value !== null && typeof value === 'object' &&
            (Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) {
            Object.entries(value).forEach(([childKey, childValue]) => addValues(childValue, `${key}[${childKey}]`));
        } else {
            parameters.append(key, String(value));
        }
    };
    Object.entries(data).forEach(([key, value]) => addValues(value, key));
    return parameters;
}

const mergeURLSearchParams = (target: URLSearchParams, source: URLSearchParams): void => {
    const replaced = new Set<string>();
    (source === target ? new URLSearchParams(source) : source).forEach((value, key) => {
        if (!replaced.has(key)) {
            target.delete(key);
            replaced.add(key);
        }
        target.append(key, value);
    });
};

const convertURLSearchParamsToObject = (searchData: URLSearchParams): object => {
    let data: object = {};
    searchData.forEach((value, originalKey) => {
        const keys = originalKey.match(/\w+/gi) ?? [];
        let nested:{[key: string]: any} = data;
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                if (originalKey.endsWith('[]')) {
                    const current = Object.prototype.hasOwnProperty.call(nested, key) ? nested[key] : undefined;
                    if (Array.isArray(current)) {
                        current.push(value);
                    } else if (current !== null && typeof current === 'object') {
                        let nextIndex = 0;
                        while (Object.prototype.hasOwnProperty.call(current, nextIndex)) nextIndex++;
                        current[nextIndex] = value;
                    } else {
                        nested[key] = current === undefined ? [value] : [current, value];
                    }
                } else {
                    nested[key] = value;
                }
            } else {
                const current = Object.prototype.hasOwnProperty.call(nested, key) ? nested[key] : undefined;
                nested[key] = Array.isArray(current) ? {...current}
                    : current !== null && typeof current === 'object' ? current
                        : current === undefined ? {} : {0: current};
                nested = nested[key];
            }
        });
    });

    return data;
};

export {convertFormDataToObject, convertObjectToFormData, convertObjectToURLSearchParams, convertURLSearchParamsToObject, mergeURLSearchParams};
