#include "recaller.h"
#include "apis/fusion_utils.h"
#include <glog/logging.h>
#include "src/apis/fusion_data.h"
namespace pearl {

void Recaller::handleRequest(std::shared_ptr<Session> session) {

    if (session->key_.size() > 0) {
           pearl::Data* data = pearl::Data::GetInstance();
           data->index_fetcher_.search(session);
    } else {
        session->status_code_ = 999;
    }
}
}
