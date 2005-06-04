from django.urls import path
from wx_login import views


urlpatterns = [
    path('wx_login/', views.save_data, name="save_data"),
    #path('wx_login/', views.get_excel_data, name='get_excel_data'),
]
