#include "query_anaylsis.h"
#include "apis/fusion_utils.h"
#include <glog/logging.h>
#include "src/apis/fusion_data.h"
namespace pearl {

void QueryAnalysis::handleRequest(std::shared_ptr<Session> session) {
    std::map<std::string, std::string> keyValuePairs = SplitString(session->url_, '&', '=');
    for (const auto& pair : keyValuePairs) {
        LOG(ERROR) << pair.first << ":" << pair.second;
    }
    if (keyValuePairs.count("key") == 0 && keyValuePairs.count("cpp_recaler") == 0) {
        session->status_code_ = 999;
        return ;
    } else {
        session->key_ = keyValuePairs["key"];
    }
    session->json_response;
}
}
