from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/")
def auth_test():
    return{"message": "Rota auth funcionando"}