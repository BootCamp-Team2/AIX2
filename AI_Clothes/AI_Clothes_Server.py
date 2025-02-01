from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from openai import OpenAI
from io import BytesIO

import cv2 as cv
import numpy as np
import os
import base64
import requests
import json
import re

load_dotenv()
OpenAI.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

def naver_search_api(items):
    url = "https://openapi.naver.com/v1/search/image"
    headers = {
        "X-Naver-Client-Id": os.getenv("NAVER_CLIENT_ID"),
        "X-Naver-Client-Secret": os.getenv("NAVER_CLIENT_SECRET")
    }

    result = []
    for item in items:
        params = {
            "query": item,
            "display": 1,
            "sort": "sim"
        }
        
        response = requests.get(url, headers = headers, params = params)
        if response.status_code == 200:
            response = response.json()
            result.append({"title": response["items"][0]["title"], "img": response["items"][0]["link"]})

    return result
        
    

def call_vision_api(image_data):
    client = OpenAI()

    response = client.chat.completions.create(
        model = "gpt-4-turbo",
        messages = [
            {
                "role": "system",
                "content": "사용자의 얼굴을 분석하고, 어울리는 패션 코디를 추천하는 AI입니다."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "사진 속 인물의 성별, 얼굴형, 이목구비, 피부색, 체형을 분석하고, 어울리는 패션 코디 3가지 (상의, 하의, 신발)를 추천해줘! 물론 추천해주는 이유도 있어야 해!! 결과는 JSON 형식으로 출력해줘!",
                    },
                    {
                        "type": "text",
                        "text": "백틱 사용하지 말고 다음과 같은 JSON 형식으로 출력해줬으면 좋겠어. {성별: , 얼굴형: , 이목구비: , 피부색: , 체형: , 코디: [{아이템: [], 이유: }]}",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}
                    },
                ],
            },
        ],
        max_tokens=1000
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
        response = call_vision_api(image_bytes_base64).replace("json", "").replace("'", '"')

        if (response):
            search_response = []; fashion_data = json.loads(response)
            for outfit in fashion_data["코디"]:
                    search_response.append(naver_search_api(outfit["아이템"]))

            return {"message": "Success!", "result_msg": response, "result_search": search_response}
        else:
            return {"message": "Error!", "result_msg": None, "result_search": None}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {e}")