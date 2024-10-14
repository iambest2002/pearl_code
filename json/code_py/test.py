import json

file_path = 'C:/Users/98140/Desktop/json/4-CET6-顺序_no_phrases.json'
output_path = 'C:/Users/98140/Desktop/json/new_json/4-CET6-顺序_no_phrases.json'

# 读取JSON文件
with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# 用于记录出现的单词
word_count = {}
duplicates = []

# 遍历JSON数据，记录word出现的次数
for entry in data:
    word = entry["word"]
    if word in word_count:
        word_count[word] += 1
        duplicates.append(word)  # 将重复的单词加入列表
    else:
        word_count[word] = 1

# 打印重复的单词
print("重复的单词有：", duplicates)

# 删除重复的单词条目（包括 translations 键）
filtered_data = []
seen_words = set()

for entry in data:
    word = entry["word"]
    # 如果是第一次看到这个单词，保留它
    if word not in seen_words:
        filtered_data.append(entry)
        seen_words.add(word)

# 将处理后的数据写回到一个新文件中
with open(output_path, 'w', encoding='utf-8') as file:
    json.dump(filtered_data, file, ensure_ascii=False, indent=4)

print("处理完成后的数据已写入", output_path)
