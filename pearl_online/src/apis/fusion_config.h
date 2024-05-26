
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

    int port = 80;
};
}