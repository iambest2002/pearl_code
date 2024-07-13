#include "packer.h"
#include "rapidjson/document.h"
#include <glog/logging.h>
#include "src/apis/fusion_data.h"
#include <codecvt>
#include <string>
#include <iostream>
#include <locale>
using namespace rapidjson;
namespace pearl {

void Packer::handleRequest(std::shared_ptr<Session> session) {
    pearl::Data* data = pearl::Data::GetInstance();
    if (session->key_.size() == 0) {
        session->status_code_ = 999;
        return ;
    }
    std::wstring_convert<std::codecvt_utf8<wchar_t>,wchar_t> converter; // make data as wstring format
    Value result(kArrayType);
    for (auto& one_result : session->rank_results_) {
            auto& doc_info = data->index_fetcher_.documents_[one_result.document_id];
            LOG(ERROR) << doc_info.document_id << " titile:" << converter.to_bytes(doc_info.title) << " body:" 
            << converter.to_bytes(doc_info.body) <<  " cmd:" 
            << doc_info.response;
            Value obj(kObjectType);
            auto to_string = [](auto value) {
                std::ostringstream os;
                os << value;
                return os.str();
            };
            std::string id = to_string(doc_info.document_id);
            obj.AddMember("id", id, session->json_response.GetAllocator());
            obj.AddMember("body", converter.to_bytes(doc_info.body), session->json_response.GetAllocator());
            obj.AddMember("title", converter.to_bytes(doc_info.body), session->json_response.GetAllocator());
            obj.AddMember("response", doc_info.response, session->json_response.GetAllocator());
            result.PushBack(obj, session->json_response.GetAllocator());
    }
    session->json_response.AddMember("result", result, session->json_response.GetAllocator());
    rapidjson::Value key("status_code", session->json_response.GetAllocator());
    rapidjson::Value value("0", session->json_response.GetAllocator());
    session->json_response.AddMember(key, value, session->json_response.GetAllocator());
    LOG(ERROR) << "1";
}
}