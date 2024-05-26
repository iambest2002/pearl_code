#include "fusion_resource.h"
#include <glog/logging.h>

namespace pearl {
Resource* Resource::instance = nullptr;
bool Resource::init(Config* conf_ptr) {
    LOG(INFO) << "server_conf_file:" << conf_ptr;

    return true;
}
}