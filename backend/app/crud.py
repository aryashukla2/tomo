from sqlalchemy.orm import Session
from . import models, schemas

def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_tasks(db: Session):
    return db.query(models.Task).all()

def create_chunk(db: Session, chunk: schemas.ChunkCreate, task_id: int):
    db_chunk = models.Chunk(**chunk.model_dump(), task_id=task_id)
    db.add(db_chunk)
    db.commit()
    db.refresh(db_chunk)
    return db_chunk
