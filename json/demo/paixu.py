import json

file_path = 'C:/Users/98140/Desktop/json/new_json/5-考研-顺序_no_phrases.json'
output_path = 'C:/Users/98140/Desktop/json/new_json/5-考研-顺序_sorted.json'

# 读取JSON文件
with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# 按照单词的字母顺序排序（保持原有的大小写）
# 先按字母排序
sorted_data = sorted(data, key=lambda x: x['word'].lower())

# 创建两个列表：一个存放首字母为小写的单词，另一个存放首字母为大写的单词
lowercase_words = [entry for entry in sorted_data if entry['word'][0].islower()]
uppercase_words = [entry for entry in sorted_data if entry['word'][0].isupper()]

# 将大写单词放在小写单词后面
final_sorted_data = lowercase_words + uppercase_words

# 将处理后的数据写回到一个新文件中
with open(output_path, 'w', encoding='utf-8') as file:
    json.dump(final_sorted_data, file, ensure_ascii=False, indent=4)

print(f"排序后的数据已写入 '{output_path}'")
