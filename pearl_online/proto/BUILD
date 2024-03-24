package(default_visibility = ["//visibility:public"])

# pb的编译
proto_library(
    name = "c++_http_proto",
    srcs = [
        "http.proto",
    ],
    visibility = ["//visibility:public"],
)

# 将pb编译声明为一个依赖dep
cc_proto_library(
    name = "http_proto",
    deps = [
        ":c++_http_proto",
    ],
    visibility = ["//visibility:public"],
)