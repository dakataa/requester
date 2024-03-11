"use strict";
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
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function(target, all) {
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = function(to, from, except, desc) {
    if (from && typeof from === "object" || typeof from === "function") {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            var _loop = function() {
                var key = _step.value;
                if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
                    get: function() {
                        return from[key];
                    },
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
            };
            for(var _iterator = __getOwnPropNames(from)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return to;
};
var __toCommonJS = function(mod) {
    return __copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
};
// src/index.ts
var src_exports = {};
__export(src_exports, {
    InterceptEvent: function() {
        return InterceptEvent_default;
    },
    Method: function() {
        return Method_default;
    },
    RequestBodyType: function() {
        return RequestBodyType_default;
    },
    default: function() {
        return src_default;
    }
});
module.exports = __toCommonJS(src_exports);
// src/enum/Method.ts
var Method = /* @__PURE__ */ function(Method2) {
    Method2["POST"] = "POST";
    Method2["GET"] = "GET";
    Method2["PUT"] = "PUT";
    return Method2;
}(Method || {});
var Method_default = Method;
// src/Response.ts
var RequesterResponse = /*#__PURE__*/ function() {
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
var RequestBodyTypeHeaders = (_obj = {}, _define_property(_obj, "form-data" /* FormData */ , {
    "Content-Type": "multipart/form-data"
}), _define_property(_obj, "x-www-form-urlencoded" /* Urlencoded */ , {
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
        var keys = originalKey.match(/\w+/gi);
        var lastKey = Object.create(keys).pop();
        var nested = data;
        (keys || []).forEach(function(key) {
            if (key === lastKey) {
                var _nested_key;
                nested[key] = originalKey.match(/\[]$/i) ? Object.assign((_nested_key = nested[key]) !== null && _nested_key !== void 0 ? _nested_key : [], [
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
var convertObjectToFormData = function(data, formData, parentKeys) {
    formData = formData || new FormData();
    for(var key in data){
        var value = data[key];
        var keyPath = _to_consumable_array(parentKeys || []).concat([
            key
        ]);
        if (_instanceof(value, Object)) {
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
// src/Requester.ts
var _Requester = /*#__PURE__*/ function() {
    function _Requester(config) {
        _class_call_check(this, _Requester);
        this.config = config || _Requester.defaults;
    }
    _create_class(_Requester, [
        {
            key: "fetch",
            value: function fetch1(param) {
                var url = param.url, _param_method = param.method, method = _param_method === void 0 ? Method_default.GET : _param_method, body = param.body, query = param.query, signal = param.signal, auth = param.auth, headers = param.headers;
                var _this_config;
                url = new URL(url, ((_this_config = this.config) === null || _this_config === void 0 ? void 0 : _this_config.baseURL) || void 0);
                var search = new URLSearchParams(_object_spread({}, Object.fromEntries(_instanceof(query, URLSearchParams) ? query : new URLSearchParams(query)), Object.fromEntries(url.searchParams), new URLSearchParams((auth === null || auth === void 0 ? void 0 : auth.getQuery()) || {})));
                console.log("search", search.toString());
                url.search = search.toString();
                var abortController = new AbortController();
                var options = {
                    signal: signal || abortController.signal,
                    method: method || Method_default.GET,
                    headers: _object_spread({}, headers, (auth === null || auth === void 0 ? void 0 : auth.getHeaders()) || {}, this.config.headers || {})
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
            value: function get(url, params) {}
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
    InterceptEvent: InterceptEvent,
    Method: Method,
    RequestBodyType: RequestBodyType
});
//# sourceMappingURL=index.js.map