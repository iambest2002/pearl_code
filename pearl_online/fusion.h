#include "proto/http.pb.h"
#include "memory"
#include "src/kernel.h"
namespace pearl {

// Service with static path.
class HttpServiceImpl : public FusionService {
public:
    HttpServiceImpl() {};
    virtual ~HttpServiceImpl() {};
    bool init();
    void query(google::protobuf::RpcController* cntl_base,
              const HttpRequest*,
              HttpResponse*,
              google::protobuf::Closure* done);
    std::string handle(std::string& url);
    std::vector<std::shared_ptr<Node>> dag;

};
}