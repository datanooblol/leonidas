import os
import re

def fix_imports_in_file(filepath):
    """Fix import statements in a single file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix core.config imports
    content = re.sub(r'from core\.config import', 'from package.core.config import', content)
    
    # Fix core.auth_middleware imports
    content = re.sub(r'from core\.auth_middleware import', 'from package.core.auth_middleware import', content)
    
    # Fix routers.* imports
    content = re.sub(r'from routers\.(\w+)\.(\w+) import', r'from package.routers.\1.\2 import', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed imports in {filepath}")

def fix_all_imports():
    """Fix imports in all Python files in the package directory"""
    package_dir = "package"
    
    for root, dirs, files in os.walk(package_dir):
        for file in files:
            if file.endswith('.py') and not file.startswith('__'):
                filepath = os.path.join(root, file)
                fix_imports_in_file(filepath)

if __name__ == "__main__":
    fix_all_imports()
    print("All imports fixed!")