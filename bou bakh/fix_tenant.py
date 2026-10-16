import re

with open('ecole/src/main/java/ecole_221/sn/ecole/modules/superadmin/application/service/TenantService.java', 'r') as f:
    content = f.read()

content = content.replace('''        Organization org = OrganizationFactory.create(
                command.name(),
                OrganizationType.ECOLE,
                OrganizationStatus.PENDING,
                null, // slug
                OrganizationType.ECOLE,
                OrganizationStatus.PENDING,
                command.country(),''', '''        Organization org = OrganizationFactory.create(
                command.name(),
                OrganizationType.ECOLE,
                OrganizationStatus.PENDING,
                null, // slug
                command.country(),''')

with open('ecole/src/main/java/ecole_221/sn/ecole/modules/superadmin/application/service/TenantService.java', 'w') as f:
    f.write(content)
