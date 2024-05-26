#include "fusion_session.h"
namespace pearl {
bool Session::init(const std::string& url) {
    url_ = url;
    json_response.SetObject();
}
}