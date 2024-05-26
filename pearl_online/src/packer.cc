#include "packer.h"
#include "rapidjson/document.h"
#include <glog/logging.h>
using namespace rapidjson;
namespace pearl {

void Packer::handleRequest(std::shared_ptr<Session> session) {
    rapidjson::Value key("status_code", session->json_response.GetAllocator());
    rapidjson::Value value("0", session->json_response.GetAllocator());
    session->json_response.AddMember(key, value, session->json_response.GetAllocator());
    LOG(ERROR) << "1";
}
}