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
        port_ = document["port"].GetInt64();

    }

    if (document.HasMember("csv_file") && document["csv_file"].IsString()) {
        LOG(ERROR) << document["csv_file"].GetString();
        csv_file_ = document["csv_file"].GetString();

    }

    if (document.HasMember("max_index_count") && document["max_index_count"].IsString()) {
        LOG(ERROR) << document["max_index_count"].GetString();
        max_index_count_ = atoi(document["max_index_count"].GetString());

    }
    if (document.HasMember("ii_buffer_update_threshold") && document["ii_buffer_update_threshold"].IsString()) {
        LOG(ERROR) << document["ii_buffer_update_threshold"].GetString();
        ii_buffer_update_threshold_ = atoi(document["ii_buffer_update_threshold"].GetString());

    }
    if (document.HasMember("token_len") && document["token_len"].IsString()) {
        LOG(ERROR) << document["token_len"].GetString();
        token_len_ = atoi(document["token_len"].GetString());

    }
    return true;
}
}