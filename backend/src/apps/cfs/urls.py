from django.urls import path
from cfs.api import views

urlpatterns = [
    path('cfs/', views.CFSView.as_view(), name='cfs'),
]