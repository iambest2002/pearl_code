
#pragma once
#include <mutex>
#include <string>
#include <vector>
#include "rapidjson/rapidjson.h"
#include "rapidjson/writer.h"
#include "rapidjson/document.h"
namespace pearl {

typedef struct {
    int document_id;
    double score;
} rank_resluts;
class Session {
public:
    // Private constructor to prevent instantiation
    Session() {}
    ~Session() {}

    bool init(const std::string& url);
    std::string url_;
    rapidjson::Document json_response;
    int status_code_ = 0;
    std::string key_;
    std::vector<int> related_doc_ids_;
    std::vector<int> display_doc_ids_;
    std::vector<std::pair<int,std::wstring>> query_tokens_;
    std::vector<rank_resluts> rank_results_;  

};
}