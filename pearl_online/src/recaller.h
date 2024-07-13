#pragma once
#include "node.h"

namespace pearl {
class Recaller : public Node {
public:
    bool init(const std::string& conf) { return true; }
    Recaller() {}
    virtual ~Recaller() {}
    virtual void handleRequest(std::shared_ptr<Session> session);
};
}