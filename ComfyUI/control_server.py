from fastapi import FastAPI
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
server_status: Dict[str, bool] = {
    "http://192.168.1.2:8001": False,
    "http://192.168.1.2:8004": False,
}

class ServerStatus(BaseModel):
    server_ip: str
    status: bool

@app.get("/check-server")
async def check_server(server_ip: str):
    status = server_status.get(server_ip, None)
    if status is None:
        return {"error": "Server not found"}
    return {"server_name": server_ip, "status": status}

@app.post("/update-status")
async def update_status(status: ServerStatus):    
    """
    각 FastAPI 서버가 상태를 업데이트하는 요청을 보냅니다.
    """
    server_status[status.server_ip] = status.status
    return {"message": f"Server {status.server_ip} status updated to {status.status}"}


@app.get("/select-server")
async def select_server():
    """
    사용 가능한 FastAPI 서버를 선택하여 응답합니다. (사용 가능한 서버가 없다면 다른 처리)
    """
    available_servers = [server for server, status in server_status.items() if not status]
    
    if available_servers:
        selected_server = available_servers[0]  # 첫 번째로 사용 가능한 서버
        server_status[selected_server] = True  # 서버 사용 중으로 변경
        return {"server_ip": f"{selected_server}"}
    else:
        return {"server_ip": ""}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("control_server:app", host="192.168.1.2", port=1000)