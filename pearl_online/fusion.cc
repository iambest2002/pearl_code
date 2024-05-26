
#include <brpc/server.h>
#include "gflags/gflags.h"
#include <brpc/restful.h>
#include "fusion.h"
#include <butil/logging.h>
#include <memory>
#include "src/apis/fusion_session.h"
#include "rapidjson/rapidjson.h"
#include "rapidjson/writer.h"
#include "rapidjson/document.h"
#include "src/query_anaylsis.h"
#include "src/packer.h"
namespace pearl {

bool HttpServiceImpl::init() {
    std::shared_ptr<QueryAnalysis> queryanalysis = std::make_shared<QueryAnalysis>();
    if (!queryanalysis->init("todo")) {
        return false;
    } 
    dag.push_back(queryanalysis);

    std::shared_ptr<Packer> packer = std::make_shared<Packer>();
    if (!packer->init("todo")) {
        return false;
    } 
    dag.push_back(packer);
}
void HttpServiceImpl::query(google::protobuf::RpcController* cntl_base,
            const HttpRequest*,
            HttpResponse*,
            google::protobuf::Closure* done) {
    // This object helps you to call done->Run() in RAII style. If you need
    // to process the request asynchronously, pass done_guard.release().
    brpc::ClosureGuard done_guard(done);
    
    brpc::Controller* cntl =
        static_cast<brpc::Controller*>(cntl_base);
    // Fill response.
    cntl->http_response().set_content_type("text/plain");
    LOG(ERROR) << cntl->http_request().uri().query();
    std::string url = cntl->http_request().uri().query();
    std::string response = handle(url);
    cntl->response_attachment().append(response);
}

std::string HttpServiceImpl::handle(std::string& url) {
    std::shared_ptr<Session> session_ptr(new Session());
    if (!session_ptr->init(url)) {
        return "";
    }
    for (auto& node : dag) {
        node->handleRequest(session_ptr);
    }
    rapidjson::StringBuffer buffer;
    rapidjson::Writer<rapidjson::StringBuffer> writer(buffer);
    session_ptr->json_response.Accept(writer);  // Serialize the content
    LOG(ERROR) << buffer.GetString();
    return buffer.GetString();  // Get the serialized string
}
}  // namespace example