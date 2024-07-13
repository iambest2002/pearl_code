#pragma once
#include "node.h"

namespace pearl {
class QueryAnalysis : public Node {
public:
    bool init(const std::string& conf) { return true; }
    QueryAnalysis() {}
    virtual ~QueryAnalysis() {}
    virtual void handleRequest(std::shared_ptr<Session> session);
};
}