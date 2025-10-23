from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from package.routers.auth.endpoint import router as auth_router
from package.routers.projects.endpoint import router as projects_router
from package.routers.sessions.endpoint import router as sessions_router
from package.routers.files.endpoint import router as files_router
from package.routers.chat.endpoint import router as chat_router
from dotenv import load_dotenv

load_dotenv(override=True)

app = FastAPI(title="Leonidas AI Data Scientist", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(projects_router, prefix="/projects", tags=["Projects"])
app.include_router(sessions_router, prefix="/sessions", tags=["Sessions"])
app.include_router(files_router, prefix="/files", tags=["Files"])
app.include_router(chat_router, tags=["Chat"])

@app.get("/")
def root():
    return {"message": "Leonidas AI Data Scientist API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/favicon.ico")
def favicon():
    return {"message": "No favicon"}

# Lambda handler
handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
