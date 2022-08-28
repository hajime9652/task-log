import logging
from fastapi import Depends, FastAPI, Request, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import User, Project, Record, create_db_and_tables, get_async_session
from app.schemas import (
    UserCreate, UserRead, UserUpdate,
    ProjectCreate, ProjectUpdate,
    RecordCreate, RecordUpdate,
    EmailStr
)
from app.users import (
    auth_backend,
    current_active_user,
    fastapi_users,
    google_oauth_client,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['localhost', 'localhost:3000'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = f'{exc}'.replace('\n', ' ').replace('   ', ' ')
    logging.error(f"{request}: {exc_str}")
    content = {'status_code': 10422, 'message': exc_str, 'data': None}
    return JSONResponse(content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)
app.include_router(
    fastapi_users.get_oauth_router(
        google_oauth_client,
        auth_backend,
        "SECRET",
        associate_by_email=True
    ),
    prefix="/auth/google",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_oauth_associate_router(
        google_oauth_client,
        UserRead,
        "SECRET"
    ),
    prefix="/auth/associate/google",
    tags=["auth"],
)

@app.get("/users/me/projects", tags=["users"])
async def get_user_active_projects(user: User = Depends(current_active_user)):
    return [item for item in user.projects if item.is_active]


@app.post("/users/me/project", tags=["users"])
async def create_project(obj_in: ProjectCreate, user: User = Depends(current_active_user), db: AsyncSession = Depends(get_async_session)):
    db_obj= Project(**obj_in.dict(), owner_id=user.id)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return user

@app.patch("/users/me/project/{project_id}", tags=["users"])
async def update_project(project_id: int, obj_in:ProjectUpdate, user: User = Depends(current_active_user), db: AsyncSession = Depends(get_async_session)):
    for item in user.projects:
        if item.id == project_id:
            db_obj = item
            break
    
    obj_data = jsonable_encoder(db_obj)
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    for field in obj_data:
        if field in update_data:
            setattr(db_obj, field, update_data[field])
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return user

@app.get("/users/me/records", tags=["users"])
async def get_user_records(user: User = Depends(current_active_user)):
    return sorted([item for project in user.projects if project.is_active for item in project.records], key=lambda x: x.time_created, reverse=True)

@app.patch("/users/me/project/record/{record_id}", tags=["users"])
async def update_project(record_id: int, obj_in:RecordUpdate, user: User = Depends(current_active_user), db: AsyncSession = Depends(get_async_session)):
    for projects in user.projects:
        for item in projects.records:
            if item.id == record_id:
                db_obj = item
                break
    
    obj_data = jsonable_encoder(db_obj)
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    for field in obj_data:
        if field in update_data:
            setattr(db_obj, field, update_data[field])
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return sorted([item for project in user.projects for item in project.records], key=lambda x: x.time_created )

@app.delete("/users/me/project/record/{record_id}", tags=["users"])
async def update_project(record_id: int, user: User = Depends(current_active_user), db: AsyncSession = Depends(get_async_session)):
    for projects in user.projects:
        for item in projects.records:
            if item.id == record_id:
                db_obj = item
                await db.delete(db_obj)
                await db.commit()
                return sorted([item for project in user.projects for item in project.records], key=lambda x: x.time_created )


@app.post("/users/me/project/{project_id}/record", tags=["users"])
async def create_record(project_id: int, obj_in: RecordCreate, user: User = Depends(current_active_user), db: AsyncSession = Depends(get_async_session)):
    _id = None
    for item in user.projects:
        if item.id == project_id:
            _id = item.id
            break
    if _id is None:
        logging.error(f"The user dosn't has this project")
        raise HTTPException(status_code=400, detail="The user doesn't have enough privilege")    

    db_obj= Record(**obj_in.dict(), project_id=_id)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

# @app.on_event("startup")
# async def on_startup():
#     # Not needed if you setup a migration system like Alembic
#     await create_db_and_tables()
