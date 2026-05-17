# HopeHRS Database ERD

## HR Tables

employee (empno PK, lastname, firstname, gender, birthdate, hiredate, sepDate, record_status, stamp)

department (deptCode PK, deptName, record_status, stamp)

job (jobCode PK, jobDesc, record_status, stamp)

jobHistory (empNo PK/FK→employee, jobCode PK/FK→job, effDate PK, salary, deptCode FK→department, record_status, stamp)

## Relationships
- jobHistory.empNo → employee.empno  (many job history rows per employee)
- jobHistory.jobCode → job.jobCode   (many job history rows per job)
- jobHistory.deptCode → department.deptCode

## Rights Tables

user (id PK/FK→auth.users, email, firstname, lastname, username, user_type, record_status, stamp)
Module (moduleCode PK, moduleDesc, record_status, stamp)
rights (rightCode PK, rightDesc, right_value, moduleCode FK→Module, record_status, stamp)
user_module (id PK, user_id FK→user, moduleCode FK→Module, rights_value)
UserModule_Rights (id PK, user_id FK→user, rightCode FK→rights, right_value)

## Soft Delete Rule
- NEVER use DELETE. Set record_status = 'INACTIVE' instead.
- Cascade: soft-deleting an employee must also set all their jobHistory rows to INACTIVE.