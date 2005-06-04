from django.db import models

# Create your models here.
# 在 Django 的 models.py 文件中定义模型



class SelectedData(models.Model):
    data = models.CharField(max_length=100)  # 假设选择的数据是字符串类型

    class Meta:
        app_label = 'wx_login'

    def __str__(self):
        return self.data
