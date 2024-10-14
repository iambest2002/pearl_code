import os
import json
from collections import defaultdict

import json
import os

def add_ids_to_words(input_folder, output_folder):
    with open(input_folder, 'r', encoding='utf-8') as f:
        words = json.load(f)

    # 用于跟踪每个字母的计数
    letter_count = {}

    for word_data in words:
        first_letter = word_data['word'][0].upper()
        if first_letter not in letter_count:
            letter_count[first_letter] = 1
        else:
            letter_count[first_letter] += 1

        # 添加 _id
        word_data['_id'] = f"{first_letter}{letter_count[first_letter]}"

    # 保存到新的文件
    with open(output_folder, 'w', encoding='utf-8') as f:
        json.dump(words, f, ensure_ascii=False, indent=4)

# 使用示例

input_folder = 'C:/Users/86199/Desktop/json/new_json/5-考研-顺序_sorted.json'  # JSON 文件夹路径
output_folder = 'C:/Users/86199/Desktop/json/new_json/id_json/5-考研-顺序_sorted_id.json'  # 输出文件夹路径

add_ids_to_words(input_folder, output_folder)
