import re

with open('ecole/src/test/java/ecole_221/sn/ecole/modules/platform/organization/OrganizationTest.java', 'r') as f:
    content = f.read()

content = re.sub(r'(OrganizationFactory\.create\(\s*.*?,\s*OrganizationType\.ECOLE\s*,\s*".*?"\s*\);)', r'\1', content, flags=re.DOTALL)

# For the create with full args:
content = content.replace('''OrganizationFactory.create(
            "École Test",
            OrganizationType.ECOLE,
            OrganizationStatus.ACTIVE,
            "Senegal",''', '''OrganizationFactory.create(
            "École Test",
            OrganizationType.ECOLE,
            OrganizationStatus.ACTIVE,
            null, // slug
            "Senegal",''')

with open('ecole/src/test/java/ecole_221/sn/ecole/modules/platform/organization/OrganizationTest.java', 'w') as f:
    f.write(content)
