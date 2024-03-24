
#pragma once
#include <iostream>
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

    bool init(const std::string& file_path);

    // Method to get the singleton instance
    static Config* GetInstance() {
        std::lock_guard<std::mutex> lock(mutex);
        if (!instance) {
            instance = new Config();
        }
        return instance;
    }

    int port;
};

// Initialize static members outside the class definition
Config* Config::instance = nullptr;
std::mutex Config::mutex;



}