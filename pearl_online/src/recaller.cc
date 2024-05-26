#include "recaller.h"
#include "apis/fusion_utils.h"
#include <glog/logging.h>
#include "src/apis/fusion_resource.h"
namespace pearl {

void Recaller::handleRequest(std::shared_ptr<Session> session) {

    if (session->key_.size() > 0) {
           pearl::Resource* resoure = pearl::Resource::GetInstance();
           resoure->index_fetcher_.search(session->key_);
    } else {
        session->status_code_ = 999;
    }
}
}
