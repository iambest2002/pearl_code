#include "fusion_resource.h"
#include <glog/logging.h>
#include "sys/stat.h"

namespace pearl {
Resource* Resource::instance = nullptr;
bool Resource::init(Config* conf_ptr) {
    LOG(INFO) << "server_conf_file:" << conf_ptr;
    pearl::Config* config = pearl::Config::GetInstance();
    struct stat buffer;
    if (config->csv_file_.size() > 0 && stat(config->csv_file_.c_str(), &buffer) == 0) {
        index_fetcher_.init(config);
    } else {
        LOG(INFO) << "csv file is empty:" << config->csv_file_;
        return false;
    }
    return true;
}
}