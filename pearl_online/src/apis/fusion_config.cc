#include "fusion_config.h"
#include <glog/logging.h>
#include "rapidjson/document.h"
#include "rapidjson/filereadstream.h"
using namespace rapidjson;
namespace pearl {
// Initialize static members outside the class definition
Config* Config::instance = nullptr;
bool Config::init(const std::string& server_conf_file) {
    LOG(INFO) << "server_conf_file:" << server_conf_file;
    FILE* configFile = fopen(server_conf_file.c_str(), "r");
    char readBuffer[65536];
    FileReadStream is(configFile, readBuffer, sizeof(readBuffer));

    Document document;
    document.ParseStream(is);

    // Check if the document is valid JSON
    if (document.HasParseError()) {
        LOG(ERROR) << "Error parsing JSON";
        return false;
    }

    // Accessing values from the parsed JSON
    if (document.HasMember("port") && document["port"].IsInt64()) {
        LOG(ERROR) << document["port"].GetInt64();
        port = document["port"].GetInt64();

    }
    return true;
}
}