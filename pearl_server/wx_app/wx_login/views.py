from django.http import JsonResponse
import pandas as pd
from datetime import datetime
from django.core.cache import cache
import os

import pytz

def save_data(request):
    if request.method == 'GET':
        # 获取 GET 请求的参数
        datacode = request.GET.get('datacode')
        input2_data = request.GET.get('input2_data', '')
        picker_value1 = request.GET.get('picker_value', '')
        picker_value2 = request.GET.get('picker_value2', '')
        picker_date = request.GET.get('picker_date', '')
        picker_time = request.GET.get('picker_time', '')


        ts = pytz.timezone('Asia/Shanghai')
        timestamp = datetime.now(ts).replace(microsecond=0,tzinfo=None)

        # 根据 datacode 值决定将数据写入哪个工作表
        if datacode == '1':
            file_path = r'/root/DC/wx_app/csv/consume_log.csv'
            new_data = {
                '消费类型': [picker_value1],
                '消费价格': [input2_data],
                '日期': [picker_date],
                '时间': [picker_time],
                '服务器时间': [timestamp],
            }
        elif datacode == '0':
            file_path = r'/root/DC/wx_app/csv/Query_date.csv'
            new_data = {
                '最近天数': [picker_value2],
                '服务器时间': [timestamp],
            }
        else:
            return JsonResponse({'status': 'error', 'message': '无效的 datacode'})
        try:
            # 读取现有的 CSV 文件，如果文件不存在，则创建一个新的空 DataFrame
            if os.path.exists(file_path):
                df = pd.read_csv(file_path)
            else:
                df = pd.DataFrame()
            
            # 创建新的 DataFrame
            df_new = pd.DataFrame(new_data)
            
            # 追加新的数据到现有 DataFrame
            df_updated = pd.concat([df, df_new], ignore_index=True)

            # 将更新后的 DataFrame 保存回 CSV 文件
            df_updated.to_csv(file_path, index=False)

            # 设置缓存
            cache.set('picker_value2', picker_value2, timeout=300)
            
            return JsonResponse(new_data)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    else:
        return JsonResponse({'status': 'error', 'message': '仅支持 GET 请求'})


