# pb的编译
proto_library(
    name = "c++_http_proto",
    srcs = [
        "/root/project/pearl/proto/http.proto",
    ],
)
# 将pb编译声明为一个依赖dep
cc_proto_library(
    name = "cc_c++_http_proto",
    deps = [
        ":c++_http_proto",
    ],
)