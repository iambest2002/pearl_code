#pragma once
#include "kernel.h"

namespace pearl {
class Rank : public Node {
public:
    bool init(const std::string& conf) { return true; }
    Rank() {}
    virtual ~Rank() {}
    virtual void handleRequest(std::shared_ptr<Session> session);
    int display_limit = 3;
};
}