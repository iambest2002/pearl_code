#include "index_manager.h"
#include <iostream>
#include <locale>
#include <codecvt>
#include <fstream>
#include <string>
#include <cmath>
namespace pearl {
int IndexManager::init(Config* config) {
    csv_file_ = config->csv_file_;
    token_len_ = config->token_len_;
    max_index_count_ = config->max_index_count_;
    ii_buffer_update_threshold_  = config->ii_buffer_update_threshold_;
    if (csv_file_.size() > 0) {
        load_csv();
    }
    return 0;
}

void IndexManager::load_csv() {
    std::ifstream file(csv_file_.c_str());
    std::string line;
    std::wstring_convert<std::codecvt_utf8<wchar_t>,wchar_t> converter; // make data as wstring format
    std::vector<std::vector<std::string>> lines_data;   // 存储切分后的数据

    std::getline(file,line); // skip first line.
    while(std::getline(file, line)) {
        std::vector<std::string> line_data;
        std::stringstream ss(line);
        std::string cell;
        while(std::getline(ss,cell, ',')) {
            line_data.push_back(cell);
        }
        lines_data.push_back(line_data);
    }

    for (int index = 0; index < lines_data.size(); index++) {
        auto& one_line = lines_data[index];
        // max index number, if bigger it , not load.
        if (indexed_count_ > max_index_count_) {
            break;
        }

        documents tmp_doc; // writing doc into cache.
        tmp_doc.document_id = std::atoi(one_line[0].c_str());
        tmp_doc.title = converter.from_bytes(one_line[1]);

        if (one_line[2] == "null") {
            tmp_doc.body = converter.from_bytes(one_line[1]);
        } else {
            tmp_doc.body = converter.from_bytes(one_line[1] + one_line[2]); //make tile and body into body.
        }

        tmp_doc.response = one_line[3]; //command into line;

        documents_[tmp_doc.document_id] = tmp_doc;
        document_info_[tmp_doc.title] = tmp_doc.document_id;

        // build index
        text_to_postings_lists(tmp_doc.document_id,tmp_doc.body);
        indexed_count_++;  //all count into index

        // print all info, to_bytes can print for people understand.
        std::string title = converter.to_bytes(tmp_doc.title);
        std::string body = converter.to_bytes(tmp_doc.body);
        LOG(INFO) << tmp_doc.document_id << ", title:" << title << ",body:" << body << ", artile_count:"  << indexed_count_;
    }

    // make all index can sort by id , and  position also had sort.
    for (auto& it : tokens_) {
        sort(it.second.postings_list_.begin(), it.second.postings_list_.end(), [](const new_postings_list&a, const new_postings_list& b) {
            return a.document_id < b.document_id;
        });
    }

    // debug info 
    for (auto& it : tokens_) {
        LOG(ERROR) << "tokenid" << it.second.token_id  << ", token" << converter.to_bytes(it.second.token) << 
        ", 词元出现的文章数量:" << it.second.docs_count  << ", 词元在所有文章中出现的总次数:" <<  it.second.token_count;
        for (auto& post_it : it.second.postings_list_) {
            LOG(ERROR) << " 999 document_id" << post_it.document_id  << ", positions数量" << post_it.positions_count;
            // 所有的位置信息
            for (auto& postion_it : post_it.new_positions) {
                LOG(ERROR) << " 992 post " << postion_it;
            }
        }
    }

}

int IndexManager::text_to_postings_lists(const int document_id, std::wstring& text) {
    int ret = 0;
    int position = 0;
    std::wstring_convert<std::codecvt_utf8<wchar_t>,wchar_t> converter; // make data as wstring format
    std::wstring token;
    while(ret = ngram_next(text, token, position) == 0) {
        if (token.size() < token_len_) {
            break;
        }
        LOG(ERROR) << "text_to_postings_lists info " << converter.to_bytes(text) << " token" 
        << converter.to_bytes(token) << " pos:" <<position - token_len_;
        token_postings_list(document_id, token, position -token_len_);
        // move one step every times.
        position = position - token_len_ + 1;
    }
    return 0;
}

int IndexManager::ngram_next(std::wstring& text, std::wstring& token, int& position) {
    token.clear();

    // todo , skip , "" char, using really word.
    // 爷爷的手机， 爷爷， 爷的， 的手， 手机
    // get split word.
    for (int i = 0; i < token_len_ && position < text.length(); i++) {
        token.push_back(text[position]);
        position++;
    }
}

int IndexManager::token_postings_list(const int document_id, std::wstring& token, int position) {
    int token_id = 0;
    if (tokens_info_.count(token) > 0) {
        token_id = tokens_info_[token];
        auto& index_list = tokens_[token_id].postings_list_;
        // 如果这个词在在该文章 id 下已经插入了， 那就继续补充到末尾。 
        if (!index_list.empty() && index_list.back().document_id == document_id) {
            tokens_[token_id].token_count++;
            // 这个是自动有顺序的，从小到大。 
            index_list.back().new_positions.push_back(position);
            // 词元数量 加 1， 后面用来计算分数。 
            index_list.back().positions_count++;
        } else {
            // 如果这个文档之前没有插入的话， 就插入到末尾。 
            // 文档 id插入进去， 和 文档的倒排链一一对应
            tokens_[token_id].doc_numbers_.push_back(document_id);
            tokens_[token_id].token_count++; // 这个词的总倒排数量， 用来排序的
            tokens_[token_id].docs_count++;
            new_postings_list tmp_posting;
            tmp_posting.document_id = document_id;
            tmp_posting.new_positions.push_back(position);
            tmp_posting.positions_count++;  // 这个文章中这个词的出现数量。也是用来排序的。
            index_list.push_back(tmp_posting);
        }
    } else {
        // 没有在词元的话， 就构建一个新的
        token_invert_index tmp_invert_index;
        token_id = tokens_info_.size() + 1;
        tmp_invert_index.token_id = token_id;
        tmp_invert_index.token = token;
        tmp_invert_index.token_count++;  // 所有词元数量。
        tmp_invert_index.docs_count = 1; // init, 文档默认给 1. 
        tmp_invert_index.doc_numbers_.push_back(document_id);

        new_postings_list tmp_posting;
        tmp_posting.document_id = document_id;
        tmp_posting.new_positions.push_back(position);
        tmp_posting.positions_count = 1;  // 这个文章中这个词的出现数量。也是用来排序的。  

        tmp_invert_index.postings_list_.push_back(tmp_posting);
        tokens_[token_id] = tmp_invert_index;
        tokens_info_[token] = tmp_invert_index.token_id; // 单独构建个数据结构， 这样可以用过词找 到词元的 id， 从而拿到对应倒排信息。 搜索的时候会用到。
    }
    return 0;
}

bool IndexManager::search(std::shared_ptr<Session> session) {
    std::string& query = session->key_;
    std::vector<std::pair<int,std::wstring>>& query_tokens = session->query_tokens_;
    std::vector<int>& result = session->related_doc_ids_;
    int ret = 0;
     
    
    std::wstring_convert<std::codecvt_utf8<wchar_t>,wchar_t> converter; // make data as wstring format
    std::wstring query_wstr = converter.from_bytes(query);

    std::wstring token;
    int position = 0;
    while(ret = ngram_next(query_wstr, token, position) == 0) {
        if (token.size() < token_len_) {
            break;
        }
        LOG(ERROR) << "text_to_postings_lists info " << converter.to_bytes(query_wstr) << " token:" 
        << converter.to_bytes(token) << " pos:" <<position - token_len_;
        if (position - token_len_ >= 0) {
            query_tokens.push_back(std::make_pair(position - token_len_, token));
        }
        // move one step every times.
        position = position - token_len_ + 1;
    }
     LOG(ERROR) << "token size : " << query_tokens.size();

    // 从 token 中找到 词元id, 找到词元id 中文档id 一样的内容。 
    std::map<int, int> doc_cnt;
    for (auto& it : query_tokens) {
        int index = it.first;
        std::wstring token_content = it.second;

        if (tokens_info_.count(token_content) > 0) {
            int token_index  = tokens_info_[token_content];
            // 每个单词出现的 文章 id 都统计一下。 这样如果 ++ n次的话， 就代表都出现过。
	       for (auto doc_id_it : tokens_[token_index].doc_numbers_) {
                doc_cnt[doc_id_it]++;
            }
        }

        // 找到词元都出现的文档， 但是不一定词顺序一致。所以不是最终的。
        std::vector<int> related_docs;
        for (auto& one_doc : doc_cnt) {
            if (one_doc.second == query_tokens.size()) {
                related_docs.push_back(one_doc.first);
                LOG(ERROR) << "relate doc id :" << one_doc.first;
            }
        }

        // 将所有的索引都放到一个 vector中， 词源 1 给 1 ， 词源 2 给 2， 词源 3 给 3， 找到 123 同时出现的地方就是匹配到了， 如果次数多的话， 就是代表高频。
        std::vector<int> find_query_features;
        for(auto& relate_doc_id : related_docs) {
            // 这里是不是有问题， resize 这个大小？ 
            find_query_features.resize(documents_[relate_doc_id].body.size());
                int query_index = 1;
                for (auto it : query_tokens) {
                    std::wstring token_content = it.second;
                    LOG(ERROR) << converter.to_bytes(token_content);

                    if (tokens_info_.count(token_content) > 0) {
                        int token_index = tokens_info_[token_content];
                        auto& posting_list = tokens_[token_index].postings_list_;
                        // 找到 doc id 对应中倒排的起始位置
                        auto lef_it = std::lower_bound(posting_list.begin(), posting_list.end(), relate_doc_id, 
                        [](const new_postings_list& a, int target)  {
                            return a.document_id < target;
                        });

                        // 从起始位置开始， 将词源在这个文档的位置都设置为 query index
                        if (lef_it != posting_list.end() && lef_it->document_id == relate_doc_id) {
                            for (auto& pos :lef_it->new_positions)  {
                                if (find_query_features.size() > pos) {
                                    find_query_features[pos] = query_index;
                                    LOG(ERROR) << "token index" << query_index << ",pos:" << pos;
                                } else {
                                    LOG(ERROR) << pos << "out of range";
                                }
                            }
                        }
                    } 
                    query_index++;
                }

                for(auto featrue_it : find_query_features) {
                    LOG(ERROR) << featrue_it;
                }

                // 构建连续的字符串， 例如 1234， 然后在find_query_features中找。
                std::vector<int> sub_squence;
                sub_squence.resize(query_tokens.size());
                for (int i = 0; i < query.size(); i++) {
                    sub_squence[i] = i + 1;
                }

                for(auto sub_squence_it : sub_squence) {
                    LOG(ERROR) << sub_squence_it;
                }

                int match_count = 0;
                auto it = find_query_features.begin();
                for(int i = 0; i < find_query_features.size(); i++) {
                    for (int j = 0; j <sub_squence.size(); j++) {
                        if (sub_squence[j] != find_query_features[i]) {
                            break;
                        }
                        if (j == sub_squence.size() -1) {
                            match_count++;
                            LOG(ERROR) << "find it" << i;
                            //找到之后继续向下找
                            i += sub_squence.size();
                        }
                    }
                }

                if (match_count > 0) {
                    LOG(ERROR) << "recaller doc_id " << relate_doc_id;
                    result.push_back(relate_doc_id);
                }
        }
     }
    return true;
}

std::vector<int> IndexManager::rank(std::vector<int>& related_doc_ids, int display_limit) {
    std::vector<int> result;


}

double IndexManager::calc_tf_idf(std::vector<std::pair<int, std::wstring>>& query_token, int doc_id) {
    double score = 0.0;
    for(auto& it : query_token) {
        int index = it.first;
        std::wstring token_content = it.second;
        // 获取对应的 token, 拿到倒排长度等信息用于计算tf/idf。
        if (tokens_info_.count(token_content) > 0) {
            int token_index = tokens_info_[token_content];
            // 总的文档数量
            int all_doc = indexed_count_;
            // 这个词原出现过的文档数量
            int this_token_all_doc = tokens_[token_index].docs_count;

            // 这个文档出现过的该词源次数
            int doc_token_cnt = 0;
            if(tokens_.count(token_index) > 0) {
                doc_token_cnt = tokens_[token_index].postings_list_.size();
            }
            // 这个文档的总单词数量
            int doc_all_tokens = 0;
            doc_token_cnt = documents_[doc_id].body.size();

            double idf = log2((double)this_token_all_doc/all_doc );
            score += ((double)doc_token_cnt / doc_all_tokens) * idf;

        }
    }
    return 0;
}

}
