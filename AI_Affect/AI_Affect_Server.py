from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from openai import OpenAI

from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

import os
import re

load_dotenv()
OpenAI.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# 🎯 GiftedChat 메시지 형식 정의
class User(BaseModel):
    _id: int
    name: str

class Message(BaseModel):
    _id: str
    text: str
    createdAt: datetime
    user: User

def call_openai_api(messages: List[Message]) -> str:
    client = OpenAI()

    request_messages = [
        {
            "role": "System",
            "content": [
                {
                    "type": "text",
                    "text": '''
                        ## Role
                        - 너는 연애 전문가야

                        ## Task
                        - 두 사용자의 대화를 보고 분석해서 현재 두 사람의 연애상대로서의 점수를 평가해줘.
                        - 0점에서 100점 사이로 평가. (판단하기에 중간 사이인 것 같고, 애매하다 그러면 1점으로 상세하게 점수부여)
                        - 점수에 가장 크게 기여한 대화내용과 그렇게 점수를 평가한 이유도 알려줘.
                        - 앞으로 어떤 대화 스타일을 이어가면 좋을지도 추천해줄래??

                        (예시)
                        100점 : 서로 완전하게 신뢰하고 사랑하는 사이
                        75점 : 서로에게 어느정도 호감이 있고, 관심이 있는 상태
                        50점 : 그냥 아무런 감정이 없는 상태
                        25점 : 서로에게 호감도 없고, 관심이 없는 상태
                        0점 : 서로가 극단적으로 싫어하는 상태

                        ## Response Example
                        [score]: ~~~

                        [key_conversation]
                        A: ~~~~~~
                        B: ~~~~~~
                        ...

                        [reason]: ~~~~

                        [recommendation]: ~~~~~~~

                        ## TIP
                        - 최근에 대화한 내용에 좀 더 초점을 두고 평가해줘. 물론! 전에 했던 대화내용을 반영하지 말라는 소리는 아니야
                    '''
                }
            ]
        }
    ]

    request_messages.append([{ "role": "user", "content": msg.text } for msg in messages])
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=request_messages,
        max_tokens=2048
    )

    return response.choices[0].message.content

@app.post("/chat/analysis")
async def conversation_analysis(messages: List[Message]):
    print("Received Message: ", messages)

    try:
        response = await call_openai_api(messages)
        response = response.replace("'", '"')
        match = re.search(r'\{.*\}', response, re.DOTALL)
        
        if match: response = match.group()

        if(response):
            return {"status": "success", "analysis": response}
        else:
            return {"status": "failed", "analysis": None}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {e}")