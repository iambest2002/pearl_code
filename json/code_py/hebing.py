import json

file_path = 'C:/Users/98140/Desktop/json/old_json/3-CET4-顺序.json'
output_path = 'C:/Users/98140/Desktop/json/old_json/3-CET4-顺序_词组.json'

# 读取JSON文件
with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# 用于记录出现的单词和它们的合并结果
word_dict = {}
duplicates = []

# 遍历JSON数据，记录相同单词并合并translations
for entry in data:
    word = entry["word"]
    if word in word_dict:
        # 单词重复，合并translations
        word_dict[word]["translations"].extend(entry.get("translations", []))
        duplicates.append(word)  # 将重复的单词加入列表
    else:
        # 初始化新单词
        word_dict[word] = {
            "word": word,
            "translations": entry.get("translations", [])
        }

# 打印重复的单词
print("重复的单词有：", set(duplicates))

# 将结果转化为列表
merged_data = list(word_dict.values())

# 将处理后的数据写回到一个新文件中
with open(output_path, 'w', encoding='utf-8') as file:
    json.dump(merged_data, file, ensure_ascii=False, indent=4)

print(f"处理完成后的数据已写入 '{output_path}'")
