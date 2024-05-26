
#pragma once
#include <mutex>
#include <string>
#include "fusion_config.h"

namespace pearl {
class Resource {
public:
    // Private constructor to prevent instantiation
    Resource() {}
    static Resource* instance;
    static std::mutex mutex;
    Resource& operator=(const Resource&) = delete;
    ~Resource() {}
    
    bool init(Config* conf_ptr);

    // Method to get the singleton instance
    static Resource* GetInstance() {
        if (!instance) {
            instance = new Resource();
        }
        return instance;
    }
};
}