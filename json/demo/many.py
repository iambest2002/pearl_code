import json
from collections import defaultdict

# 文件路径
file_paths = [
    'C:/Users/98140/Desktop/json/new_json/3-CET4-顺序_sorted.json',
    'C:/Users/98140/Desktop/json/new_json/4-CET6-顺序_sorted.json',
    'C:/Users/98140/Desktop/json/new_json/5-考研-顺序_sorted.json'
]

# 存储单词集合
word_sets = []
file_word_counts = []
merged_words = set()

# 读取每个文件并提取单词
for file_path in file_paths:
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        # 将每个文件的单词提取出来，存储在集合中
        word_set = set(entry['word'] for entry in data)
        word_sets.append(word_set)
        file_word_counts.append(len(word_set))  # 统计单词数量
        merged_words.update(word_set)  # 将单词合并到集合中

# 打印每个文件的单词数量
for i, file_path in enumerate(file_paths):
    print(f"{file_path} 中的单词数量：{file_word_counts[i]}")

# 找出三个集合中的相同单词（交集）
common_words = set.intersection(*word_sets)

# 打印相同的单词数量
print(f"三个表中的相同单词数量：{len(common_words)}")

# 打印相同的单词
print("三个表中的相同单词有：", common_words)

# 将所有单词按照首字母分类
word_categories = defaultdict(list)

# 遍历合并后的单词集合，将单词按首字母分类
for word in merged_words:
    first_letter = word[0].upper()  # 获取首字母，并转换为大写
    word_categories[first_letter].append(word)

# 打印每个分类的单词数量
for letter in sorted(word_categories.keys()):
    print(f"字母 '{letter}' 分类下的单词数量：{len(word_categories[letter])}")

# 打印每个分类的单词列表（可选）
# for letter, words in sorted(word_categories.items()):
#     print(f"字母 '{letter}' 分类下的单词有：{sorted(words)}")
