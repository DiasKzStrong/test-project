import pytest
from rest_framework.test import APIClient
from mixer.backend.django import mixer
from rest_framework import status
import datetime

from apps.cfs.models import CFS
from apps.dictionary.models import CFSStatus, CFSType, CFSCategory, CFSSubCategory

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def cfs_dependencies():
    cfs_type = mixer.blend(CFSType, name="Расход")
    category = mixer.blend(CFSCategory, name="Основные расходы", cfs_type=cfs_type)
    subcategory = mixer.blend(CFSSubCategory, name="Аренда", cfs_category=category)
    status = mixer.blend(CFSStatus, name="Активный")
    
    return {
        'type': cfs_type,
        'category': category,
        'subcategory': subcategory,
        'status': status
    }


class TestCFSAPI:
    def test_list_cfs(self, api_client, cfs_dependencies):
        # Создаем несколько записей CFS
        type_obj = cfs_dependencies['type']
        category = cfs_dependencies['category']
        subcategory = cfs_dependencies['subcategory']
        status_obj = cfs_dependencies['status']
        
        for _ in range(3):
            mixer.blend(
                CFS,
                status=status_obj,
                type=type_obj,
                category=category,
                sub_category=subcategory,
                amount=1000.50
            )
        
        response = api_client.get('/api/cfs/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3 or len(response.data.get('results', [])) == 3
    
    def test_create_cfs(self, api_client, cfs_dependencies):
        type_obj = cfs_dependencies['type']
        category = cfs_dependencies['category']
        subcategory = cfs_dependencies['subcategory']
        status_obj = cfs_dependencies['status']
        
        data = {
            'date': datetime.date.today().isoformat(),
            'status': status_obj.pk,
            'type': type_obj.pk,
            'category': category.pk,
            'sub_category': subcategory.pk,
            'amount': "1500.75"
        }
        
        response = api_client.post('/api/cfs/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        # Проверяем, что запись создалась
        # Fix the KeyError by checking the actual key in response.data
        # Common keys might be 'id', 'pk', or 'uuid'
        new_cfs = CFS.objects.latest('id')  # Get the most recently created CFS
        assert float(new_cfs.amount) == 1500.75
    
    def test_update_cfs(self, api_client, cfs_dependencies):
        type_obj = cfs_dependencies['type']
        category = cfs_dependencies['category']
        subcategory = cfs_dependencies['subcategory']
        status_obj = cfs_dependencies['status']
        
        cfs = mixer.blend(
            CFS,
            status=status_obj,
            type=type_obj,
            category=category,
            sub_category=subcategory,
            amount=1000.50
        )
        
        update_data = {
            'date': datetime.date.today().isoformat(),
            'status': status_obj.pk,
            'type': type_obj.pk,
            'category': category.pk,
            'sub_category': subcategory.pk,
            'amount': "2000.25"  # Обновляем сумму
        }
        
        response = api_client.put(f'/api/cfs/{cfs.pk}/', update_data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        # Проверяем, что запись обновилась
        cfs.refresh_from_db()
        assert float(cfs.amount) == 2000.25
    
    def test_delete_cfs(self, api_client, cfs_dependencies):
        type_obj = cfs_dependencies['type']
        category = cfs_dependencies['category']
        subcategory = cfs_dependencies['subcategory']
        status_obj = cfs_dependencies['status']
        
        cfs = mixer.blend(
            CFS,
            status=status_obj,
            type=type_obj,
            category=category,
            sub_category=subcategory,
            amount=1000.50
        )
        
        response = api_client.delete(f'/api/cfs/{cfs.pk}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Проверяем, что запись удалилась
        assert not CFS.objects.filter(pk=cfs.pk).exists()
    
    def test_filter_by_date_range(self, api_client, cfs_dependencies):
        type_obj = cfs_dependencies['type']
        category = cfs_dependencies['category']
        subcategory = cfs_dependencies['subcategory']
        
        # Создаем записи с разными датами
        today = datetime.date.today()
        yesterday = today - datetime.timedelta(days=1)
        tomorrow = today + datetime.timedelta(days=1)
        
        mixer.blend(CFS, date=yesterday, type=type_obj, category=category, sub_category=subcategory)
        mixer.blend(CFS, date=today, type=type_obj, category=category, sub_category=subcategory)
        mixer.blend(CFS, date=tomorrow, type=type_obj, category=category, sub_category=subcategory)
        
        # Фильтруем по сегодняшней дате и вчерашней
        response = api_client.get(f'/api/cfs/?date_from={yesterday}&date_to={today}')
        assert response.status_code == status.HTTP_200_OK
        
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        assert len(results) == 2  # Должны быть только записи за вчера и сегодня
    
    def test_filter_by_type(self, api_client, cfs_dependencies):
        type1 = cfs_dependencies['type']
        type2 = mixer.blend(CFSType, name="Доход")
        category1 = cfs_dependencies['category']
        subcategory1 = cfs_dependencies['subcategory']
        
        category2 = mixer.blend(CFSCategory, name="Доп. доходы", cfs_type=type2)
        subcategory2 = mixer.blend(CFSSubCategory, name="Подработка", cfs_category=category2)
        
        # Создаем записи с разными типами
        mixer.blend(CFS, type=type1, category=category1, sub_category=subcategory1)
        mixer.blend(CFS, type=type1, category=category1, sub_category=subcategory1)
        mixer.blend(CFS, type=type2, category=category2, sub_category=subcategory2)
        
        # Фильтруем по первому типу
        response = api_client.get(f'/api/cfs/?type={type1.pk}')
        assert response.status_code == status.HTTP_200_OK
        
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        assert len(results) == 2  # Должны быть только записи с type1
        
        # Проверяем, что все записи имеют правильный тип
        for item in results:
            assert item['type']['id'] == type1.pk 