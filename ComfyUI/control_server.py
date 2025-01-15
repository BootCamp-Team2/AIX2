from fastapi import FastAPI, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Dict

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.1.30:8081"],  # React 개발 서버 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INPUT_FOLDER = "./input"
OUTPUT_FOLDER = "./output"

# 정적 파일 폴더 설정
app.mount("/input", StaticFiles(directory=INPUT_FOLDER), name="input")
app.mount("/output", StaticFiles(directory=OUTPUT_FOLDER), name="output")

## false - 사용 가능 / true - 사용 불가능
avatar_server_status: Dict[str, bool] = {
    "http://192.168.1.4:8001": False,
    "http://192.168.1.4:8002": False,
}

sim_server_status: Dict[str, bool] = {
    "http://192.168.1.4:9001": False,
    "http://192.168.1.4:9001": False,
}

class ServerStatus(BaseModel):
    server_ip: str
    status: bool

@app.get("/check-server")
async def check_server(server_ip: str):
    status = avatar_server_status.get(server_ip, None)
    if status is None:
        return {"error": "Server not found"}
    return {"server_name": server_ip, "status": status}

@app.post("/update-status")
async def update_status(status: ServerStatus):    
    avatar_server_status[status.server_ip] = status.status
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("control_server:app", host="192.168.1.4", port=1000)