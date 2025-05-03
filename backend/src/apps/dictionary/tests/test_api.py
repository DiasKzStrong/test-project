import pytest
from rest_framework.test import APIClient
from mixer.backend.django import mixer
from rest_framework import status

from apps.dictionary.models import CFSStatus, CFSType, CFSCategory, CFSSubCategory

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


class TestCFSStatusAPI:
    def test_list_statuses(self, api_client):
        mixer.cycle(3).blend(CFSStatus)
        response = api_client.get('/api/dictionaries/cfs-statuses/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        
    def test_create_status(self, api_client):
        data = {"name": "Тестовый статус"}
        response = api_client.post('/api/dictionaries/cfs-statuses/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert CFSStatus.objects.filter(name="Тестовый статус").exists()
        
    def test_update_status(self, api_client):
        status_obj = mixer.blend(CFSStatus, name="Старый статус")
        data = {"name": "Новый статус"}
        response = api_client.put(f'/api/dictionaries/cfs-statuses/{status_obj.pk}/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        status_obj.refresh_from_db()
        assert status_obj.name == "Новый статус"
        
    def test_delete_status(self, api_client):
        status_obj = mixer.blend(CFSStatus)
        response = api_client.delete(f'/api/dictionaries/cfs-statuses/{status_obj.pk}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not CFSStatus.objects.filter(pk=status_obj.pk).exists()


class TestCFSTypeAPI:
    def test_list_types(self, api_client):
        mixer.cycle(3).blend(CFSType)
        response = api_client.get('/api/dictionaries/cfs-types/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        
    def test_create_type(self, api_client):
        data = {"name": "Тестовый тип"}
        response = api_client.post('/api/dictionaries/cfs-types/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert CFSType.objects.filter(name="Тестовый тип").exists()
    
    def test_types_with_categories(self, api_client):
        cfs_type = mixer.blend(CFSType)
        mixer.cycle(3).blend(CFSCategory, cfs_type=cfs_type)
        
        response = api_client.get('/api/dictionaries/cfs-types/categories/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0
        assert 'categories' in response.data[0]
        assert len(response.data[0]['categories']) == 3


class TestCFSCategoryAPI:
    def test_list_categories(self, api_client):
        mixer.cycle(3).blend(CFSCategory)
        response = api_client.get('/api/dictionaries/cfs-categories/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        
    def test_create_category(self, api_client):
        cfs_type = mixer.blend(CFSType)
        data = {
            "name": "Тестовая категория",
            "cfs_type": cfs_type.pk
        }
        response = api_client.post('/api/dictionaries/cfs-categories/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert CFSCategory.objects.filter(name="Тестовая категория").exists()
    
    def test_categories_with_subcategories(self, api_client):
        category = mixer.blend(CFSCategory)
        mixer.cycle(3).blend(CFSSubCategory, cfs_category=category)
        
        response = api_client.get('/api/dictionaries/cfs-categories/subcategories/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0
        
        # Находим нашу категорию в ответе
        category_data = next((c for c in response.data if c['id'] == category.pk), None)
        assert category_data is not None
        assert 'subcategories' in category_data
        assert len(category_data['subcategories']) == 3 