from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from openai import OpenAI
from io import BytesIO

import cv2 as cv
import numpy as np
import os
import base64

load_dotenv()
OpenAI.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

def call_vision_api(image_data):
    client = OpenAI()

    response = client.chat.completions.create(
        model = "gpt-4o-mini",
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": '우선 사진속 사람의 특징들을 분석해서 결과 알려줘 얼굴형이라던지 이목구비 성별 체형 피부색 등 그리고 그 외모에 맞는 패션 코디를 추천해줘 패션 코디는 총 3가지 추천해줘 한글로해라 example output format : { "성별": "남성", "얼굴형": "둥근 형태", "이목구비": "검은 머리, 안경착용", "피부색": "따뜻한 톤", "체형": "슬림", "연령":"", "코디 리스트": [ {"상의": "", "하의": "", "신발": "", "기타악세사리": "", "추천이유":"외모 특징들 근거로 대면서 자세히써라"}, {}... ]'
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}
                    },
                ],
            },
        ],
        max_tokens=300,
    )

    return response.choices[0].message.content

def resize_img(image, width, height):
    original_height, original_width = image.shape[:2]
    aspect_ratio = original_width / original_height

    # 새로운 크기 계산
    if aspect_ratio > (width / height):
        # 가로 기준 크기 조정
        new_width = width
        new_height = int(width / aspect_ratio)
    else:
        # 세로 기준 크기 조정
        new_height = height
        new_width = int(height * aspect_ratio)

    # 이미지 크기 조정
    resized_image = cv.resize(image, (new_width, new_height), interpolation=cv.INTER_AREA)

    # 패딩 계산
    pad_top = (height - new_height) // 2
    pad_bottom = height - new_height - pad_top
    pad_left = (width - new_width) // 2
    pad_right = width - new_width - pad_left

    # 패딩 추가
    padded_image = cv.copyMakeBorder(
        resized_image, 
        pad_top, pad_bottom, pad_left, pad_right, 
        cv.BORDER_CONSTANT, 
        value = (0, 0, 0)
    )

    return padded_image

@app.post("/uploads/clothes-recommend")
async def clothes_recommend(img : UploadFile = File(...)):
    try:
        image_data = await img.read()
        np_array = np.frombuffer(image_data, np.uint8)
        image = cv.imdecode(np_array, cv.IMREAD_COLOR)

        padded_img = resize_img(image, 512, 512)
        _, buffer = cv.imencode(".jpg", padded_img)
        padded_image_bytes = BytesIO(buffer)

        image_bytes_base64 = base64.b64encode(padded_image_bytes.getvalue()).decode("utf-8")
        response = call_vision_api(image_bytes_base64)

        if (response):
            return {"message": "Success!", "result": response}
        else:
            return {"message": "Error!", "result": None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {e}")