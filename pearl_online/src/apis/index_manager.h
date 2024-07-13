#pragma once
#include "glog/logging.h"
#include "algorithm"
#include <map>
#include <string>
#include "fusion_config.h"
#include "fusion_session.h"

namespace pearl {

struct documents {
    int document_id = 0;
    std::wstring title;
    std::wstring body;
    std::string response;
};

struct  new_postings_list {
    int document_id = 0;
    std::vector<int> new_positions;
    int positions_count = 0;
};

typedef struct {
    int token_id = 0;
    std::wstring token;
    std::vector<new_postings_list> postings_list_;
    std::vector<int> doc_numbers_;
    int docs_count = 0;
    int token_count = 0;
} token_invert_index;





class IndexManager {
public:
    int init(Config* config);
    void load_csv();
    int text_to_postings_lists(const int document_id, std::wstring& text);
    int token_postings_list(const int document_id, std::wstring& token, int position);
    int ngram_next(std::wstring& text, std::wstring& token, int& position);
    bool search(std::shared_ptr<Session> session);
    double calc_tf_idf(std::vector<std::pair<int, std::wstring>>& query_token, int doc_id);
    std::vector<int> rank(std::vector<int>& related_doc_ids, int display_limit);
    std::string csv_file_;
    int max_index_count_ = 0;
    int ii_buffer_update_threshold_ = 0;
    int indexed_count_ = 0;
    int token_len_ = 2;

    std::map<std::wstring, int> document_info_; //存储所有文档， key是名字， value是编号。 
    std::map<int, documents> documents_;   //存储所有文档，  key 是编号， value 是文档的具体信息。 
    std::map<std::wstring, int> tokens_info_;  // 每个词元对应的 id, 词源 id全局唯一， id是 token的编号
    std::map<int, token_invert_index> tokens_;  // 倒排索引的缓存
};
}