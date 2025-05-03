#!/bin/bash

set -e

cd /app/src

echo "Creating initial data..."
# Use python -c to execute a command directly instead of shell with heredoc
python manage.py shell -c "
from apps.dictionary.models import CFSStatus, CFSType, CFSCategory, CFSSubCategory

# Create statuses
statuses = ['Бизнес', 'Личное', 'Налог']
for status_name in statuses:
    CFSStatus.objects.get_or_create(name=status_name)
    print(f'Created status: {status_name}')

# Create types
types = ['Пополнение', 'Списание']
for type_name in types:
    CFSType.objects.get_or_create(name=type_name)
    print(f'Created type: {type_name}')

# Create categories and subcategories
categories_with_subcategories = {
    'Инфраструктура': ['VPS', 'Proxy'],
    'Маркетинг': ['Farpost', 'Avito']
}

for category_name, subcategories in categories_with_subcategories.items():
    # Get or create the first type for demonstration
    cfs_type = CFSType.objects.first()
    
    category, created = CFSCategory.objects.get_or_create(
        name=category_name,
        cfs_type=cfs_type
    )
    print(f'Created category: {category_name}')
    
    for subcategory_name in subcategories:
        CFSSubCategory.objects.get_or_create(
            name=subcategory_name,
            cfs_category=category
        )
        print(f'Created subcategory: {subcategory_name}')

print('Initial data created successfully!')
"

echo "Initial data setup completed!"
