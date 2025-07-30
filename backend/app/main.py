from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import crud, models, schemas, database
from contextlib import asynccontextmanager
from datetime import date, timedelta
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    models.Base.metadata.create_all(bind=database.engine)

    # Initialize UserStats
    db = database.SessionLocal()
    try:
        stats = db.query(models.UserStats).first()
        if not stats:
            db.add(models.UserStats())
            db.commit()
            print("✅ UserStats initialized")
    finally:
        db.close()

    yield  # Run the app

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/focus-sessions/", response_model=schemas.FocusSession)
def create_focus_session(session: schemas.FocusSessionCreate, db: Session = Depends(get_db)):
    db_session = models.FocusSession(**session.model_dump())
    db.add(db_session)

    # 🎯 Update XP, level, and streaks
    stats = db.query(models.UserStats).first()
    if stats:
        stats.total_xp += session.xp_earned
        stats.current_level = (stats.total_xp // 100) + 1

        today = date.today()
        if stats.last_active_date == today - timedelta(days=1):
            stats.current_streak += 1
        elif stats.last_active_date != today:
            stats.current_streak = 1  # Reset streak if missed

        if stats.current_streak > stats.longest_streak:
            stats.longest_streak = stats.current_streak

        stats.last_active_date = today

    db.commit()
    db.refresh(db_session)
    return db_session

@app.post("/tasks/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db, task)

@app.get("/tasks/", response_model=list[schemas.Task])
def read_tasks(db: Session = Depends(get_db)):
    return crud.get_tasks(db)

@app.post("/tasks/{task_id}/chunks/", response_model=schemas.Chunk)
def create_chunk(task_id: int, chunk: schemas.ChunkCreate, db: Session = Depends(get_db)):
    return crud.create_chunk(db, chunk, task_id)

@app.post("/tasks/{task_id}/complete")
def complete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404)

    # Log session
    log = models.FocusSession(
        task_title=task.title,
        xp_earned=10,  # or compute based on effort
        duration=5
    )
    db.add(log)

    # Archive or delete task
    db.delete(task)  # or set task.is_archived = True
    db.commit()
    return {"message": "Task completed and logged"}

@app.post("/tasks/{task_id}/check_chunks_and_complete")
def complete_if_all_chunks_done(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404)

    chunks = task.chunks
    if all(chunk.status == "complete" for chunk in chunks):
        log = models.FocusSession(
            task_title=task.title,
            xp_earned=len(chunks) * 5,
            duration=len(chunks) * 10
        )
        db.add(log)
        db.delete(task)
        db.commit()
        return {"message": "All chunks complete. Task archived."}
    else:
        return {"message": "Not all chunks are complete yet."}
    
@app.patch("/chunks/{chunk_id}/complete")
def mark_chunk_complete(chunk_id: int, db: Session = Depends(get_db)):
    chunk = db.query(models.Chunk).filter(models.Chunk.id == chunk_id).first()
    if not chunk:
        raise HTTPException(status_code=404, detail="Chunk not found")

    chunk.status = "complete"
    db.commit()
    db.refresh(chunk)

    # Optionally return progress
    task = db.query(models.Task).filter(models.Task.id == chunk.task_id).first()
    if task:
        total = len(task.chunks)
        completed = sum(1 for c in task.chunks if c.status == "complete")
        progress = completed / total
    else:
        progress = 1.0

    return {
        "chunk_id": chunk_id,
        "status": "complete",
        "task_progress": progress
    }

@app.get("/stats/")
def get_user_stats(db: Session = Depends(get_db)):
    stats = db.query(models.UserStats).first()
    if not stats:
        raise HTTPException(status_code=404, detail="Stats not found")
    return {
        "total_xp": stats.total_xp,
        "current_level": stats.current_level,
        "current_streak": stats.current_streak,
        "longest_streak": stats.longest_streak,
        "last_active_date": stats.last_active_date
    }

@app.get("/focus-sessions/", response_model=list[schemas.FocusSession])
def get_focus_sessions(db: Session = Depends(get_db)):
    return db.query(models.FocusSession).order_by(models.FocusSession.created_at.desc()).all()

@app.delete("/tasks/{task_id}/")
def delete_task(task_id :int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}