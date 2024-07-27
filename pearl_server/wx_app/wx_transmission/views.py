import csv
import io
import pandas as pd
from django.http import HttpResponse, JsonResponse
from django.core.cache import cache
from datetime import datetime, timedelta
import pytz

def filter_by_date_and_time(df, date_col, time_col, picker_value2):
    tz = pytz.timezone('Asia/Shanghai')
    current_datetime = datetime.now(tz).replace(microsecond=0, tzinfo=None)
    
    if picker_value2 == '最近一天':
        start_datetime = current_datetime - timedelta(days=1)
    elif picker_value2 == '最近十天':
        start_datetime = current_datetime - timedelta(days=10)
    elif picker_value2 == '最近一个月':
        start_datetime = current_datetime - timedelta(days=30)
    elif picker_value2 == '最近三个月':
        start_datetime = current_datetime - timedelta(days=90)
    elif picker_value2 == '最近六个月':
        start_datetime = current_datetime - timedelta(days=180)
    elif picker_value2 == '最近一年':
        start_datetime = current_datetime - timedelta(days=365)
    else:
        return None  # 如果 picker_value2 不在预期值范围内，返回 None

    # 合并日期和时间列为一个新的 datetime 列
    df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
    df[time_col] = pd.to_datetime(df[time_col], format='%H:%M', errors='coerce').dt.time
    df['datetime'] = df.apply(lambda row: datetime.combine(row[date_col], row[time_col]) if pd.notnull(row[date_col]) and pd.notnull(row[time_col]) else pd.NaT, axis=1)
    df = df.dropna(subset=['datetime'])

    # 筛选出 start_datetime 之后的记录
    filtered_df = df[df['datetime'] >= start_datetime]

    # 删除临时的 datetime 列
    filtered_df = filtered_df.drop(columns=['datetime'])
    filtered_df['时间'] = filtered_df['时间'].apply(lambda t: t.strftime('%H:%M:%S') if pd.notnull(t) else '')
    return filtered_df


def filter_by_month(df, date_col, picker_value3):
    # 将月份映射到数值
    month_map = {
        '1月': 1, '2月': 2, '3月': 3, '4月': 4, '5月': 5,
        '6月': 6, '7月': 7, '8月': 8, '9月': 9, '10月': 10,
        '11月': 11, '12月': 12
    }
    selected_month = month_map.get(picker_value3)
    if selected_month is None:
        return None  # 如果 picker_value3 不在预期值范围内，返回 None

    # 获取当前年份
    current_year = datetime.now().year

    # 创建开始日期和结束日期
    start_date = datetime(current_year, selected_month, 1)
    if selected_month == 12:
        end_date = datetime(current_year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = datetime(current_year, selected_month + 1, 1) - timedelta(days=1)

    # 将日期列转换为 datetime 格式，并筛选出符合日期范围的记录
    df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
    
    filtered_df = df[(df[date_col] >= start_date) & (df[date_col] <= end_date)]
    print(filtered_df)
    return filtered_df



def excel_data(request):
    if request.method == 'GET':
        try:
            picker_value2 = cache.get('picker_value2', default=None)
            picker_value3 = cache.get('picker_value3', default=None)
            print(picker_value2,picker_value3)
            file_path = r'/root/DC/pearl_code/pearl_server/wx_app/csv/consume_log.csv'
            try:
                # 读取 CSV 文件
                df = pd.read_csv(file_path)
            except FileNotFoundError:
                return JsonResponse({'status': 'error', 'message': f'文件 {file_path} 不存在'}, status=400)

            # 根据 picker_value2 筛选日期和时间列中的数据
            filtered_df = df.copy()


            # if picker_value2:
            #     filtered_df = filter_by_date_and_time(filtered_df, '日期', '时间', picker_value2)

            #     if filtered_df is None or filtered_df.empty:
            #         return JsonResponse({'status': 'error', 'message': '没有符合条件的数据'}, status=200)

            #根据 picker_value3 筛选月份中的数据
            if picker_value3:
                filtered_df = filter_by_month(filtered_df, '日期', picker_value3)

                if filtered_df is None or filtered_df.empty:
                    return JsonResponse({'status': 'error', 'message': '没有符合条件的数据'}, status=300)

             # 将时间列格式化为仅包含小时和分钟
            
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