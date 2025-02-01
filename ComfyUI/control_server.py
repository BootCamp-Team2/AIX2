from fastapi import FastAPI, Form, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Dict
import os
import shutil

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.1.30:8081"],  # React 개발 서버 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

INPUT_FOLDER = "./input"
OUTPUT_FOLDER = "./output"

# 정적 파일 폴더 설정
app.mount("/input", StaticFiles(directory=INPUT_FOLDER), name="input")
app.mount("/output", StaticFiles(directory=OUTPUT_FOLDER), name="output")

## false - 사용 가능 / true - 사용 불가능
avatar_server_status: Dict[str, bool] = {
    "http://192.168.219.142:8001": False,
    "http://192.168.219.142:8002": False,
}

sim_server_status: Dict[str, bool] = {
    "http://192.168.219.142:9001": False,
    "http://192.168.219.142:9002": False,
}

class ServerStatus(BaseModel):
    server_ip: str
    status: bool
    type: str

@app.get("/check-server")
async def check_server(server_ip: str, type: str):
    if type == "avatar":
        status = avatar_server_status.get(server_ip, None)
    elif type == "sim":
        status = sim_server_status.get(server_ip, None)
        
    if status is None:
        return {"error": "Server not found"}
    return {"server_name": server_ip, "status": status}

@app.post("/update-status")
async def update_status(status: ServerStatus):
    if status.type == "avatar": 
        avatar_server_status[status.server_ip] = status.status
    elif status.type == "sim":
        sim_server_status[status.server_ip] = status.status
        
    return {"message": f"Server {status.server_ip} status updated to {status.status}"}

@app.post("/select-server")
async def select_server(type: str = Form(...)):
    server_status = avatar_server_status.items() if type == "avatar" else sim_server_status.items()
    available_servers = [server for server, status in server_status if not status]
    
    if available_servers:
        selected_server = available_servers[0]  # 첫 번째로 사용 가능한 서버
        if type == "avatar":
            avatar_server_status[selected_server] = True  # 서버 사용 중으로 변경
        elif type == "sim":
            sim_server_status[selected_server] = True
        
        return {"server_ip": f"{selected_server}"}
    else:
        return {"server_ip": ""}
    
@app.post("/applyAvatar")
async def apply_avatar(img_src: str = Form(...), uid: str = Form(...)):
    img_src = "./output" + img_src.split("/output", 1)[1]
    
    try:
        new_file_director = f"output/{uid}"
        if not os.path.exists(new_file_director):
            os.makedirs(new_file_director)
        new_file_path = os.path.join(new_file_director, "myAvatar.jpg")
        
        shutil.move(img_src, new_file_path)
        return {
            "message": "success!!", 
            "avatarPath": new_file_path
        }
    
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("control_server:app", host="192.168.1.4", port=1000)