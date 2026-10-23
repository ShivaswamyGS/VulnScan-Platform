from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.core.security import hash_password
from app.models.company import Company
from app.models.enums import RoleEnum
from app.models.user import User
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


# =========================================================
# GET COMPANY EMPLOYEES
# =========================================================

def get_company_employees(
    db: Session,
    company: Company,
):
    return (
        db.query(User)
        .filter(
            User.company_id == company.id,
            User.role == RoleEnum.INTERNAL_TESTER,
        )
        .all()
    )


# =========================================================
# GET EMPLOYEE
# =========================================================

def get_employee_by_id(
    db: Session,
    employee_id: int,
    company: Company,
):
    employee = (
        db.query(User)
        .filter(
            User.id == employee_id,
            User.company_id == company.id,
            User.role == RoleEnum.INTERNAL_TESTER,
        )
        .first()
    )

    if employee is None:
        raise NotFoundError("Employee not found")

    return employee


# =========================================================
# CREATE EMPLOYEE
# =========================================================

def create_employee(
    db: Session,
    company: Company,
    employee: EmployeeCreate,
):
    email = employee.email.lower().strip()
    employee_id = employee.employee_id.strip()

    # -----------------------------------------------------
    # CHECK EMAIL
    # -----------------------------------------------------

    existing_email = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_email:
        raise ConflictError(
            "An employee with this email already exists."
        )

    # -----------------------------------------------------
    # CHECK EMPLOYEE ID
    # -----------------------------------------------------

    existing_employee_id = (
        db.query(User)
        .filter(User.employee_id == employee_id)
        .first()
    )

    if existing_employee_id:
        raise ConflictError(
            f"Employee ID '{employee_id}' already exists."
        )

    # -----------------------------------------------------
    # CREATE
    # -----------------------------------------------------

    new_employee = User(
        full_name=employee.full_name,
        email=email,
        hashed_password=hash_password(employee.password),
        role=RoleEnum.INTERNAL_TESTER,
        company_id=company.id,
        department=employee.department,
        designation=employee.designation,
        employee_id=employee_id,
        is_active=True,
    )

    try:
        db.add(new_employee)
        db.commit()
        db.refresh(new_employee)

    except IntegrityError:
        db.rollback()

        raise ConflictError(
            "Employee email or employee ID already exists."
        )

    return new_employee


# =========================================================
# UPDATE EMPLOYEE
# =========================================================

def update_employee(
    db: Session,
    employee: User,
    data: EmployeeUpdate,
):
    update_data = data.model_dump(
        exclude_unset=True
    )

    # Company cannot change employee role.
    update_data.pop("role", None)

    for key, value in update_data.items():
        setattr(employee, key, value)

    try:
        db.commit()
        db.refresh(employee)

    except IntegrityError:
        db.rollback()

        raise ConflictError(
            "Unable to update employee."
        )

    return employee


# =========================================================
# DELETE EMPLOYEE
# =========================================================

def delete_employee(
    db: Session,
    employee: User,
):
    db.delete(employee)
    db.commit()