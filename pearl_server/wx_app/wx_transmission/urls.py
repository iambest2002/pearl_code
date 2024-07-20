from django.urls import path
from wx_transmission import views


urlpatterns = [
    path('wx_transmission/', views.excel_data, name='excel_data'),

    ]