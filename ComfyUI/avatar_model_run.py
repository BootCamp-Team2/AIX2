from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import importlib.util
import os
import uuid
import shutil
import httpx

import os
os.environ['KMP_DUPLICATE_LIB_OK']='True'

app = FastAPI()

SERVER_HOST = "127.0.0.1"
SERVER_PORT = "8000"

@app.middleware("http")
async def detect_server_info(request: Request, call_next):
    global SERVER_HOST, SERVER_PORT
    server = request.scope.get("server", None)
    if server:
        SERVER_HOST = server[0]
        SERVER_PORT = server[1]
    response = await call_next(request)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.1.12:8081"],  # React 개발 서버 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INPUT_FOLDER = "./input"
OUTPUT_FOLDER = "./output"

# 정적 파일 폴더 설정
app.mount("/input", StaticFiles(directory=INPUT_FOLDER), name="input")
app.mount("/output", StaticFiles(directory=OUTPUT_FOLDER), name="output")

# 허용할 파일 확장자
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "jfif"}

# my_avatar 모델 불러오기
module_name = "my_avatar"
module_path = os.path.join("custom_nodes", "ComfyUI-to-Python-Extension", "nodes", "my_avatar.py")
spec = importlib.util.spec_from_file_location(module_name, module_path)
avatar_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(avatar_module)

@app.get("/get/ip")
def getServerIP():
    return {"server-ip": f"{SERVER_HOST}", "server-port": f"{SERVER_PORT}"}

@app.post("/avatar/uploads")
async def createMyAvatar(img: UploadFile = File(...), gender: str = Form(...), userUID: str = Form(...)):
    result_path = f"output/avatar_{userUID}_00001_.jpg"
    if os.path.exists(result_path):
        os.remove(result_path)
    
    try:
        if not allowed_file(img.filename):
            raise HTTPException(status_code=400, detail="지원하지 않는 이미지 형식입니다.")
        ext = os.path.splitext(img.filename)[1]
        
        folder_path = os.path.join(INPUT_FOLDER, f"{userUID}")
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
            
        uid_img = f"avatar_1{ext}"
        img_path = os.path.join(folder_path, uid_img)
        with open(img_path, "wb") as f:
            f.write(await img.read())
            
        avatar_module.main(uid_img, userUID, gender)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"http://{SERVER_HOST}:1000/update-status", 
                json={"server_ip": f"http://{SERVER_HOST}:{SERVER_PORT}", "status": False, "type": "avatar"}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Error: {response.text}")
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    
    finally:
        # 모델 실행 후 메모리 해제
        import gc
        gc.collect()  # Python에서 객체들의 메모리를 수동으로 회수
        
        import torch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()  # GPU 메모리 캐시 정리
    
    return {
        "message": "Images uploaded successfully",
        "avatarUrl": f"http://{SERVER_HOST}:1000/{result_path}"
    }
    
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("avatar_model_run:app", host="0.0.0.0", port=8000)