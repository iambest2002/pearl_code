#include "proto/http.pb.h"


namespace pearl {

// Service with static path.
class HttpServiceImpl : public FusionService {
public:
    HttpServiceImpl() {};
    virtual ~HttpServiceImpl() {};
    void query(google::protobuf::RpcController* cntl_base,
              const HttpRequest*,
              HttpResponse*,
              google::protobuf::Closure* done);
    std::string handle(std::string& url);

};
}