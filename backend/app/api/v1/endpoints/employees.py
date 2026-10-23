from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_company
from app.db.session import get_db
from app.models.company import Company
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeRead,
    EmployeeUpdate,
)
from app.services.employee_service import (
    create_employee,
    delete_employee,
    get_company_employees,
    get_employee_by_id,
    update_employee,
)

router = APIRouter()


# =========================================================
# GET COMPANY EMPLOYEES
# =========================================================

@router.get(
    "",
    response_model=list[EmployeeRead],
)
def get_employees(
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    return get_company_employees(
        db,
        current_company,
    )


# =========================================================
# CREATE EMPLOYEE
# =========================================================

@router.post(
    "",
    response_model=EmployeeRead,
)
def add_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    return create_employee(
        db,
        current_company,
        employee,
    )


# =========================================================
# GET SINGLE EMPLOYEE
# =========================================================

@router.get(
    "/{employee_id}",
    response_model=EmployeeRead,
)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    return get_employee_by_id(
        db,
        employee_id,
        current_company,
    )


# =========================================================
# UPDATE EMPLOYEE
# =========================================================

@router.put(
    "/{employee_id}",
    response_model=EmployeeRead,
)
def edit_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    employee = get_employee_by_id(
        db,
        employee_id,
        current_company,
    )

    return update_employee(
        db,
        employee,
        data,
    )


# =========================================================
# DELETE EMPLOYEE
# =========================================================

@router.delete(
    "/{employee_id}",
)
def remove_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    employee = get_employee_by_id(
        db,
        employee_id,
        current_company,
    )

    delete_employee(
        db,
        employee,
    )

    return {
        "message": "Employee deleted successfully"
    }