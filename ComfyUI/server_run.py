from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

INPUT_FOLDER = "./input"
OUTPUT_FOLDER = "./output"

# 정적 파일 폴더 설정
app.mount("/input", StaticFiles(directory=INPUT_FOLDER), name="input")
app.mount("/output", StaticFiles(directory=OUTPUT_FOLDER), name="output")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server_run:app", host="192.168.1.2", port=8002)