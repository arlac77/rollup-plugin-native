#define NAPI_VERSION 6

#include <node_api.h>
#include <sys/uio.h>
#include <ctype.h>

namespace daemon
{
napi_value my_function(napi_env env, napi_callback_info info)
{
    napi_status status;
    size_t argc = 1;
    napi_value args[1];
    status = napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    if (status != napi_ok)
        return nullptr;

    if (argc != 1)
    {
        napi_throw_error(env, nullptr, "Wrong arguments");
    }

    size_t len;
    status = napi_get_value_string_utf8(env, args[0], nullptr, 0, &len);
    if (status != napi_ok)
        return nullptr;

    char *str = new char[len + 1];
    status = napi_get_value_string_utf8(env, args[0], str, len + 1, nullptr);
    // do something with str
    delete[] str;

    int res = 4711;
    napi_value value;
    status = napi_create_int32(env, res, &value);
    if (status != napi_ok)
        return nullptr;

    return value;
}

} // namespace daemon

napi_value init(napi_env env, napi_value exports) {
    napi_status status;
    napi_value value;

    status = napi_create_int32(env, 77, &value);
    if (status != napi_ok) return NULL;
    status = napi_set_named_property(env, exports, "samplePoperty", value);
    if (status != napi_ok) return NULL;

    status = napi_create_function(env, NULL, 0, daemon::my_function, NULL, &value);
    if (status != napi_ok) return NULL;
    status = napi_set_named_property(env, exports, "sampleFunction", value);
    if (status != napi_ok) return NULL;

    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init);
