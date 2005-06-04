import csv
import io
import pandas as pd
from django.http import HttpResponse, JsonResponse
from django.core.cache import cache
from datetime import datetime, timedelta

def filter_by_date(df, date_col, picker_value2):
    current_date = datetime.now().replace(microsecond=0)
    print(111)
    print(current_date)
    print(111)

    if picker_value2 == '最近一天':
        start_date = current_date - timedelta(days=1)
    elif picker_value2 == '最近十天':
        start_date = current_date - timedelta(days=10)
    elif picker_value2 == '最近一个月':
        start_date = current_date - timedelta(days=30)
    elif picker_value2 == '最近三个月':
        start_date = current_date - timedelta(days=90)
    elif picker_value2 == '最近六个月':
        start_date = current_date - timedelta(days=180)
    elif picker_value2 == '最近一年':
        start_date = current_date - timedelta(days=365)
    else:
        return None  # 如果 picker_value2 不在预期值范围内，返回 None

    # 将日期列转换为 datetime 类型
    df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
    df = df.dropna(subset=[date_col])

    # 筛选出 start_date 之后的记录
    return df[df[date_col] >= start_date]



def excel_data(request):
    if request.method == 'GET':
        try:
            picker_value2 = cache.get('picker_value2', default=None)
            input1_data = cache.get('input1_data', default=None, version=None)

            if not input1_data:
                return JsonResponse({'status': 'error', 'message': '没有找到 input1_data 参数'}, status=400)

            file_path = r'/root/DC/wx_app/csv/consume_log.csv'
            try:
                # 读取 CSV 文件
                df = pd.read_csv(file_path)
            except FileNotFoundError:
                return JsonResponse({'status': 'error', 'message': f'文件 {file_path} 不存在'}, status=400)

            # 根据 input1_data 筛选数据
            filtered_df = df[df['ID'] == int(input1_data)]

            if filtered_df.empty:
                return JsonResponse({'status': 'error', 'message': '没有符合条件的数据'}, status=200)

            # 根据 picker_value2 筛选日期列中的数据
            filtered_df = filter_by_date(filtered_df, '日期', picker_value2)

            if filtered_df is None or filtered_df.empty:
                return JsonResponse({'status': 'error', 'message': '没有符合条件的日期数据'}, status=200)

            # 将筛选后的 DataFrame 转换为 CSV 格式的字符串
            csv_buffer = io.StringIO()
            
            filtered_df.to_csv(csv_buffer, index=False)
            csv_data = csv_buffer.getvalue()

            response = HttpResponse(csv_data, content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename=filtered_data.csv'
            
            return response

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': '仅支持 GET 请求'})

