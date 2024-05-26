
#pragma once
#include <mutex>
#include <string>
#include "rapidjson/rapidjson.h"
#include "rapidjson/writer.h"
#include "rapidjson/document.h"
namespace pearl {
class Session {
public:
    // Private constructor to prevent instantiation
    Session() {}
    ~Session() {}

    bool init(const std::string& url);
    std::string url_;
    rapidjson::Document json_response;
};
}