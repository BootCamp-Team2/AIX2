from transformers import pipeline

# 감정 분석 모델 초기화
def initialize_emotion_model():
    return pipeline("sentiment-analysis")

# 감정을 희, 노, 애, 락 네 가지로 분류
def classify_emotion(sentiment_result):
    label = sentiment_result['label']
    score = sentiment_result['score']

    if label == "POSITIVE":
        if "happy" in sentiment_result.get('text', '').lower():
            return "희"  # 기쁨
        else:
            return "락"  # 즐거움
    elif label == "NEGATIVE":
        if "angry" in sentiment_result.get('text', '').lower():
            return "노"  # 화남
        else:
            return "애"  # 슬픔
    else:
        return "중립"

# 감정 분석 실행
def analyze_emotion(response, emotion_model):
    sentiment_result = emotion_model(response)[0]
    emotion = classify_emotion(sentiment_result)
    print(f"응답: {response}\n감정 분석: {emotion}\n")
