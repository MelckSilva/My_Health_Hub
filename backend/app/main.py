from fastapi import FastAPI
from app.routers import auth, user, professionals, services, appointments

app = FastAPI(title="My Health Hub API")

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(professionals.router)
app.include_router(services.router)
app.include_router(appointments.router)

@app.get("/")
def root():
    return {"message": "API My Health Hub funcionando"}