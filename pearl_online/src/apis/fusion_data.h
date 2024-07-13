
#pragma once
#include <mutex>
#include <string>
#include "fusion_config.h"
#include "index_manager.h"

namespace pearl {
class Data {
public:
    // Private constructor to prevent instantiation
    Data() {}
    static Data* instance;
    static std::mutex mutex;
    Data& operator=(const Data&) = delete;
    ~Data() {}

    bool init(Config* conf_ptr);

    // Method to get the singleton instance
    static Data* GetInstance() {
        if (!instance) {
            instance = new Data();
        }
        return instance;
    }
    IndexManager index_fetcher_;
};
}