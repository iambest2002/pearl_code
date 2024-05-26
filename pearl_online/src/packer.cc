#include "packer.h"
#include "rapidjson/document.h"
#include <glog/logging.h>
#include "src/apis/fusion_resource.h"
using namespace rapidjson;
namespace pearl {

void Packer::handleRequest(std::shared_ptr<Session> session) {


    if (session->key_.size() > 0) {
           pearl::Resource* resoure = pearl::Resource::GetInstance();
           resoure->index_fetcher_.rank();
    } else {
        session->status_code_ = 999;
    }

    rapidjson::Value key("status_code", session->json_response.GetAllocator());
    rapidjson::Value value("0", session->json_response.GetAllocator());
    session->json_response.AddMember(key, value, session->json_response.GetAllocator());
    LOG(ERROR) << "1";
}
}