#pragma once
#include "node.h"

namespace pearl {
class Packer : public Node {
public:
    bool init(const std::string& conf) { return true; }
    Packer() {}
    virtual ~Packer() {}
    virtual void handleRequest(std::shared_ptr<Session> session);
};
}