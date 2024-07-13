#include "rank.h"
#include "apis/fusion_utils.h"
#include <glog/logging.h>
#include "src/apis/fusion_data.h"
#include <algorithm>
namespace pearl {

void Rank::handleRequest(std::shared_ptr<Session> session) {
    if (session->key_.size() > 0) {
           pearl::Data* data = pearl::Data::GetInstance();
        for (auto& doc_id : session->related_doc_ids_) {
            double score = data->index_fetcher_.calc_tf_idf(session->query_tokens_, doc_id);
            rank_resluts tmp_result;
            tmp_result.document_id = doc_id;
            tmp_result.score = score;
            session->rank_results_.push_back(tmp_result);
        }
        // Sort the vector in ascending order
        std::sort(session->rank_results_.begin(), session->rank_results_.end(),[](const rank_resluts& a,const rank_resluts& b){
            return a.score > b.score;
        });
        if (session->rank_results_.size() > display_limit) {
            session->rank_results_.resize(display_limit);
        }
        
    } else {
        session->status_code_ = 999;
    }
}
}
