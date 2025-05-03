import pytest
from mixer.backend.django import mixer
from django.core.exceptions import ValidationError
import datetime

from apps.cfs.models import CFS
from apps.dictionary.models import CFSStatus, CFSType, CFSCategory, CFSSubCategory

pytestmark = pytest.mark.django_db


class TestCFSModel:
    def test_create_cfs(self):
        cfs_type = mixer.blend(CFSType)
        category = mixer.blend(CFSCategory, cfs_type=cfs_type)
        subcategory = mixer.blend(CFSSubCategory, cfs_category=category)
        status = mixer.blend(CFSStatus)
        
        cfs = mixer.blend(
            CFS,
            status=status,
            type=cfs_type,
            category=category,
            sub_category=subcategory,
            amount=1000.50,
            date=datetime.date.today()
        )
        
        assert cfs.pk is not None
        assert cfs.amount == 1000.50
        assert cfs.type == cfs_type
        assert cfs.category == category
        assert cfs.sub_category == subcategory
        
    def test_cfs_validation_type_category(self):
        type1 = mixer.blend(CFSType)
        type2 = mixer.blend(CFSType)
        category = mixer.blend(CFSCategory, cfs_type=type1)
        subcategory = mixer.blend(CFSSubCategory, cfs_category=category)
        
        # Создаем CFS с несоответствующими типом и категорией
        cfs = mixer.blend(
            CFS,
            type=type2,  # Другой тип
            category=category,  # Категория, принадлежащая type1
            sub_category=subcategory,
            amount=1000.0,
            _fill_optional=True,
            _save=False
        )
        
        with pytest.raises(ValidationError):
            cfs.clean()
    
    def test_cfs_validation_category_subcategory(self):
        type1 = mixer.blend(CFSType)
        category1 = mixer.blend(CFSCategory, cfs_type=type1)
        category2 = mixer.blend(CFSCategory, cfs_type=type1)
        subcategory = mixer.blend(CFSSubCategory, cfs_category=category1)
        
        # Создаем CFS с несоответствующими категорией и подкатегорией
        cfs = mixer.blend(
            CFS,
            type=type1,
            category=category2,  # Категория, не соответствующая подкатегории
            sub_category=subcategory,  # Подкатегория из category1
            amount=1000.0,
            _fill_optional=True,
            _save=False
        )
        
        with pytest.raises(ValidationError):
            cfs.clean()
    
    def test_cfs_str_method(self):
        today = datetime.date.today()
        status = mixer.blend(CFSStatus, name="Активный")
        cfs_type = mixer.blend(CFSType, name="Расход")
        category = mixer.blend(CFSCategory, name="Основные расходы", cfs_type=cfs_type)
        subcategory = mixer.blend(CFSSubCategory, name="Аренда", cfs_category=category)
        
        cfs = mixer.blend(
            CFS,
            date=today,
            status=status,
            type=cfs_type,
            category=category,
            sub_category=subcategory
        )
        
        expected_str = f"{today} - Активный - Расход - Основные расходы - Аренда"
        assert str(cfs) == expected_str 