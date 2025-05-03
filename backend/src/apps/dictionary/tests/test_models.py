import pytest
from mixer.backend.django import mixer
from django.db import IntegrityError

from apps.dictionary.models import CFSStatus, CFSType, CFSCategory, CFSSubCategory

pytestmark = pytest.mark.django_db


class TestCFSStatusModel:
    def test_create_status(self):
        status = mixer.blend(CFSStatus, name="Новый")
        assert status.pk is not None
        assert str(status) == "Новый"
        
    def test_unique_name(self):
        mixer.blend(CFSStatus, name="Уникальный")
        with pytest.raises(IntegrityError):
            mixer.blend(CFSStatus, name="Уникальный")


class TestCFSTypeModel:
    def test_create_type(self):
        cfs_type = mixer.blend(CFSType, name="Доход")
        assert cfs_type.pk is not None
        assert str(cfs_type) == "Доход"
        
    def test_unique_name(self):
        mixer.blend(CFSType, name="Уникальный")
        with pytest.raises(IntegrityError):
            mixer.blend(CFSType, name="Уникальный")


class TestCFSCategoryModel:
    def test_create_category(self):
        cfs_type = mixer.blend(CFSType)
        category = mixer.blend(CFSCategory, name="Зарплата", cfs_type=cfs_type)
        assert category.pk is not None
        assert str(category) == "Зарплата"
        assert category.cfs_type == cfs_type
        
    def test_category_type_relation(self):
        cfs_type = mixer.blend(CFSType)
        category = mixer.blend(CFSCategory, cfs_type=cfs_type)
        assert category.cfs_type.pk == cfs_type.pk


class TestCFSSubCategoryModel:
    def test_create_subcategory(self):
        cfs_type = mixer.blend(CFSType)
        category = mixer.blend(CFSCategory, cfs_type=cfs_type)
        subcategory = mixer.blend(CFSSubCategory, name="Премия", cfs_category=category)
        assert subcategory.pk is not None
        assert str(subcategory) == "Премия"
        assert subcategory.cfs_category == category
        
    def test_subcategory_category_relation(self):
        category = mixer.blend(CFSCategory)
        subcategory = mixer.blend(CFSSubCategory, cfs_category=category)
        assert subcategory.cfs_category.pk == category.pk 