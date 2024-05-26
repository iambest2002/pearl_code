
#pragma once
#include <mutex>
#include <string>

namespace pearl {
class Config {
public:
    // Private constructor to prevent instantiation
    Config() {}
    static Config* instance;
    static std::mutex mutex;
    Config& operator=(const Config&) = delete;
    ~Config() {}

    bool init(const std::string& server_conf_file);

    // Method to get the singleton instance
    static Config* GetInstance() {
        if (!instance) {
            instance = new Config();
        }
        return instance;
    }
    int port_ = 80;
    std::string csv_file_;
    std::string db_file_;
    int max_index_count_ = 0;
    int ii_buffer_update_threshold_ = 0;
    int token_len_ = 2;
};
}