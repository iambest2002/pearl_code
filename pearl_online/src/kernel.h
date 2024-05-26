#pragma once
#include "apis/fusion_session.h"

namespace pearl {
class Node {
public:
    virtual bool init(const std::string& conf) {return false;}
    Node() {}
    virtual ~Node() {}
    virtual void handleRequest(std::shared_ptr<Session> session) = 0;
};
}