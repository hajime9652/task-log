from typing import AsyncGenerator, List

from fastapi import Depends
from fastapi_users.db import (
    SQLAlchemyBaseOAuthAccountTableUUID,
    SQLAlchemyBaseUserTableUUID,
    SQLAlchemyUserDatabase,
)
from fastapi_users_db_sqlalchemy.generics import GUID
from sqlalchemy import Boolean, Column, DateTime, String, Integer, ForeignKey
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.sql import func


DATABASE_URL = "sqlite+aiosqlite:///./test.db"
Base: DeclarativeMeta = declarative_base()


class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    pass


class Record(Base):
    __tablename__ = "record"
    id = Column(Integer, primary_key=True)
    memo = Column(String)
    startTime = Column(String)
    endTime = Column(String)
    fee = Column(Integer)
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())
    project_id = Column(Integer, ForeignKey("project.id", ondelete="cascade"), nullable=False)


class Project(Base):
    __tablename__ = "project"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    fee = Column(Integer)
    is_active = Column(Boolean)
    owner_id = Column(GUID, ForeignKey("user.id", ondelete="cascade"), nullable=False)
    records: List[Record] = relationship("Record", lazy="joined")


class User(SQLAlchemyBaseUserTableUUID, Base):
    oauth_accounts: List[OAuthAccount] = relationship("OAuthAccount", lazy="joined")
    projects: List[Project] = relationship("Project", lazy="joined")


engine = create_async_engine(DATABASE_URL)
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User, OAuthAccount)
