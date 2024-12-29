// src/enum/Method.ts
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var Method = /* @__PURE__ */ function(Method2) {
    Method2["POST"] = "POST";
    Method2["GET"] = "GET";
    Method2["PUT"] = "PUT";
    Method2["DELETE"] = "DELETE";
    Method2["PATCH"] = "PATCH";
    return Method2;
}(Method || {});
var Method_default = Method;
// src/Response.ts
var RequesterResponse = /*#__PURE__*/ function() {
    "use strict";
    function RequesterResponse(response) {
        _class_call_check(this, RequesterResponse);
        this.response = response;
        this.status = response.status;
    }
    _create_class(RequesterResponse, [
        {
            key: "getData",
            value: function getData() {
                var _this = this;
                return new Promise(function(resolve, reject) {
                    var _this_response_headers_get;
                    if (_this.data) {
                        return resolve(_this.data);
                    }
                    (((_this_response_headers_get = _this.response.headers.get("content-type")) === null || _this_response_headers_get === void 0 ? void 0 : _this_response_headers_get.includes("application/json")) ? _this.response.json() : _this.response.text()).then(function(data) {
                        _this.data = data;
                        resolve(_this.data);
                    });
                });
            }
        },
        {
            key: "getHeaders",
            value: function getHeaders() {
                return this.response.headers;
            }
        }
    ]);
    return RequesterResponse;
}();
var Response_default = RequesterResponse;
// src/enum/InterceptEvent.ts
var InterceptEvent = /* @__PURE__ */ function(InterceptEvent2) {
    InterceptEvent2[InterceptEvent2["PRE_REQUEST"] = 0] = "PRE_REQUEST";
    InterceptEvent2[InterceptEvent2["POST_REQUEST"] = 1] = "POST_REQUEST";
    InterceptEvent2[InterceptEvent2["PRE_RESPONSE"] = 2] = "PRE_RESPONSE";
    InterceptEvent2[InterceptEvent2["POST_RESPONSE"] = 3] = "POST_RESPONSE";
    return InterceptEvent2;
}(InterceptEvent || {});
var InterceptEvent_default = InterceptEvent;
// src/enum/RequestBodyType.ts
var RequestBodyType = /* @__PURE__ */ function(RequestBodyType2) {
    RequestBodyType2["FormData"] = "form-data";
    RequestBodyType2["Urlencoded"] = "x-www-form-urlencoded";
    RequestBodyType2["JSON"] = "raw-json";
    RequestBodyType2["Text"] = "raw-text";
    RequestBodyType2["Xml"] = "raw-xml";
    RequestBodyType2["Html"] = "raw-html";
    RequestBodyType2["Javascript"] = "raw-javascript";
    RequestBodyType2["Binary"] = "binary";
    return RequestBodyType2;
}(RequestBodyType || {});
var _obj;
var RequestBodyTypeHeaders = (_obj = {}, _define_property(_obj, "form-data" /* FormData */ , {}), _define_property(_obj, "x-www-form-urlencoded" /* Urlencoded */ , {
    "Content-Type": "application/x-www-form-urlencoded"
}), _define_property(_obj, "raw-json" /* JSON */ , {
    "Content-Type": "application/json"
}), _define_property(_obj, "raw-text" /* Text */ , {
    "Content-Type": "text/plain"
}), _define_property(_obj, "raw-html" /* Html */ , {
    "Content-Type": "text/html"
}), _define_property(_obj, "raw-xml" /* Xml */ , {
    "Content-Type": "text/xml"
}), _define_property(_obj, "raw-javascript" /* Javascript */ , {
    "Content-Type": "text/javascript"
}), _define_property(_obj, "binary" /* Binary */ , {
    "Content-Type": "application/octet-stream"
}), _obj);
var RequestBodyType_default = RequestBodyType;
// src/helper/DataHelper.ts
var convertFormDataToObject = function(formData) {
    var data = {};
    formData.forEach(function(value, originalKey) {
        var _originalKey_match;
        var keys = (_originalKey_match = originalKey.match(/\w+/gi)) !== null && _originalKey_match !== void 0 ? _originalKey_match : [];
        if (!keys.length) {
            throw new Error("Invalid Form Data Key: " + originalKey);
        }
        var lastKey = keys.pop();
        var isArray = originalKey.endsWith("[]");
        var nested = data;
        (keys || []).forEach(function(key) {
            var _nested_key;
            nested[key] = _object_spread({}, (_nested_key = nested[key]) !== null && _nested_key !== void 0 ? _nested_key : {});
            nested = nested[key];
        });
        if (lastKey) {
            var _nested_lastKey;
            nested[lastKey] = isArray ? _to_consumable_array((_nested_lastKey = nested[lastKey]) !== null && _nested_lastKey !== void 0 ? _nested_lastKey : []).concat([
                value
            ]) : value;
        }
    });
    return data;
};
var convertObjectToFormData = function(data, formData, parentKeys) {
    formData = formData || new FormData();
    for(var key in data){
        var value = data[key];
        var keyPath = _to_consumable_array(parentKeys || []).concat([
            key
        ]);
        if (_instanceof(value, Object) && !_instanceof(value, File)) {
            formData = convertObjectToFormData(value, formData, keyPath);
            continue;
        }
        var formKey = keyPath.shift() + keyPath.map(function(k) {
            return "[" + k + "]";
        }).join("");
        formData.set(formKey, value);
    }
    return formData;
};
var convertObjectToURLSearchParams = function(data) {
    var formData = convertObjectToFormData(data);
    return new URLSearchParams(Object.fromEntries(formData.entries()));
};
var convertURLSearchParamsToObject = function(searchData) {
    var data = {};
    searchData.forEach(function(value, originalKey) {
        console.log("value", value, originalKey);
        var keys = originalKey.match(/\w+/gi);
        var lastKey = Object.create(keys).pop();
        var nested = data;
        (keys || []).forEach(function(key) {
            if (key === lastKey) {
                nested[key] = originalKey.match(/\[]$/i) ? Object.assign(nested[key] || [], [
                    value
                ]) : value;
            } else {
                nested[key] = nested[key] || {};
                nested = nested[key];
            }
        });
    });
    return data;
};
// src/Requester.ts
var _Requester = /*#__PURE__*/ function() {
    "use strict";
    function _Requester(config) {
        _class_call_check(this, _Requester);
        this.config = _object_spread({}, config, _Requester.defaults);
    }
    _create_class(_Requester, [
        {
            key: "fetch",
            value: function fetch1(param) {
                var url = param.url, _param_method = param.method, method = _param_method === void 0 ? Method_default.GET : _param_method, body = param.body, query = param.query, signal = param.signal, auth = param.auth, headers = param.headers;
                var _this_config, _this_config1;
                url = new URL(url, ((_this_config = this.config) === null || _this_config === void 0 ? void 0 : _this_config.baseURL) || void 0);
                var search = new URLSearchParams(_object_spread({}, query ? Object.fromEntries(_instanceof(query, URLSearchParams) ? query : _instanceof(query, FormData) ? convertObjectToURLSearchParams(convertFormDataToObject(query)) : new URLSearchParams(query)) : {}, Object.fromEntries(url.searchParams), new URLSearchParams((auth === null || auth === void 0 ? void 0 : auth.getQuery()) || {})));
                url.search = search.toString();
                var abortController = new AbortController();
                var options = {
                    signal: signal || abortController.signal,
                    method: method || Method_default.GET,
                    headers: _object_spread({}, headers || {}, (auth === null || auth === void 0 ? void 0 : auth.getHeaders()) || {}, ((_this_config1 = this.config) === null || _this_config1 === void 0 ? void 0 : _this_config1.headers) || {})
                };
                switch(method){
                    case Method_default.POST:
                        {
                            options = _object_spread_props(_object_spread({}, options), {
                                body: body
                            });
                        }
                }
                var timeoutInterval = setTimeout(function() {
                    return abortController === null || abortController === void 0 ? void 0 : abortController.abort();
                }, this.config.timeout || 3e4);
                _Requester.interceptors.filter(function(param) {
                    var _param = _sliced_to_array(param, 1), i = _param[0];
                    return i === InterceptEvent_default.PRE_REQUEST;
                }).forEach(function(param) {
                    var _param = _sliced_to_array(param, 2), i = _param[0], callback = _param[1];
                    options = callback(options);
                });
                return new Promise(function(resolve, reject) {
                    fetch(url, options).then(function(response) {
                        _Requester.interceptors.filter(function(param) {
                            var _param = _sliced_to_array(param, 1), i = _param[0];
                            return i === InterceptEvent_default.PRE_RESPONSE;
                        }).forEach(function(param) {
                            var _param = _sliced_to_array(param, 2), i = _param[0], callback = _param[1];
                            response = callback(response);
                        });
                        resolve(new Response_default(response));
                        _Requester.interceptors.filter(function(param) {
                            var _param = _sliced_to_array(param, 1), i = _param[0];
                            return i === InterceptEvent_default.POST_RESPONSE;
                        }).forEach(function(param) {
                            var _param = _sliced_to_array(param, 2), i = _param[0], callback = _param[1];
                            response = callback(response);
                        });
                    }).catch(function(error) {
                        return reject(error);
                    }).finally(function() {
                        return clearTimeout(timeoutInterval);
                    });
                });
            }
        },
        {
            key: "post",
            value: function post(url, body, bodyType) {
                var bodyObject = null;
                bodyType || (bodyType = RequestBodyType_default.JSON);
                switch(typeof body === "undefined" ? "undefined" : _type_of(body)){
                    case "string":
                        {
                            try {
                                bodyObject = JSON.parse(body);
                            } catch (e) {}
                            break;
                        }
                    case "object":
                        {
                            bodyObject = _instanceof(body, FormData) ? convertFormDataToObject(body) : body;
                            break;
                        }
                }
                var formData = bodyObject ? convertObjectToFormData(bodyObject) : null;
                switch(bodyType){
                    case RequestBodyType_default.Urlencoded:
                        {
                            body = bodyObject ? convertObjectToURLSearchParams(bodyObject).toString() : body;
                            break;
                        }
                    case RequestBodyType_default.FormData:
                        {
                            body = formData || body;
                            break;
                        }
                    case RequestBodyType_default.JSON:
                        {
                            body = bodyObject ? JSON.stringify(bodyObject) : body;
                            break;
                        }
                    default:
                        {}
                }
                return this.fetch({
                    url: url,
                    method: Method_default.POST,
                    body: body,
                    headers: RequestBodyTypeHeaders[bodyType]
                });
            }
        },
        {
            key: "get",
            value: function get(url, query) {
                if (!_instanceof(query, URLSearchParams)) {
                    query = convertObjectToURLSearchParams(query);
                }
                return this.fetch({
                    url: url,
                    method: Method_default.GET,
                    query: query
                });
            }
        }
    ], [
        {
            key: "on",
            value: function on(event, callable) {
                return this.interceptors.push([
                    event,
                    callable
                ]);
            }
        },
        {
            key: "off",
            value: function off(interceptorId) {
                if (this.interceptors[interceptorId] === void 0) return;
                this.interceptors.splice(interceptorId, 1);
            }
        }
    ]);
    return _Requester;
}();
_Requester.interceptors = [];
_Requester.defaults = {
    timeout: 3e3
};
var Requester = _Requester;
var Requester_default = Requester;
// src/index.ts
var src_default = Requester_default;
export { InterceptEvent_default as InterceptEvent, Method_default as Method, RequestBodyType_default as RequestBodyType, convertFormDataToObject, convertObjectToFormData, convertObjectToURLSearchParams, convertURLSearchParamsToObject, src_default as default };
//# sourceMappingURL=index.mjs.map