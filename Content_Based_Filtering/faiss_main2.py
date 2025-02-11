import pandas as pd
import mysql.connector
import faiss
import numpy as np
import json

## 원핫인코딩 리스트
gender_types = ["남성", "여성"]

mbti_types = [
    "INTJ", "INFP", "ENTP", "ESFP", "ISTJ", "ENFJ", "INFJ", "ISFP",
    "ENTJ", "ESFJ", "INTP", "ESTP", "ISFJ", "ESTJ", "ENFP", "INFJ"
]

height_types = ["작음", "평균", "큼"]

appearance_types = [
    "귀여움", "매력적", "활기참", "미소", "단아함", 
    "청순함", "중성미", "카리스마", "스포티", "패션감각"
]

def to_one_hot(value, value_types):
    vector = [1 if value == t else 0 for t in value_types]
    return vector

def list_to_multiply_hot(value_list, value_types):
    combined_vector = np.zeros(len(value_types), dtype=int) # 빈 벡터 생성 - 전부 0
    for value in value_list:
        single_vector = to_one_hot(value, value_types)
        combined_vector = np.maximum(combined_vector, single_vector)  # 합집합 처리
    return combined_vector.tolist()

def fetch_mbti_data():
    ## MySQL Server 연결
    conn = mysql.connector.connect(
        host="192.168.1.10",
        port="3307",
        user="lovepractice",
        password="500412!!",
        database="love_practice"
    )
    
    cursor = conn.cursor()

    query_row = "SELECT * FROM idealType"
    cursor.execute(query_row)
    results_others = cursor.fetchall()
        
    # for row in results_others:
    #     print(row)
    
    df = pd.DataFrame(results_others, columns=["userUID", "myGender", "recommendGender", "myMBTI", "recommendMBTI", 
                                                  "myHeight", "favoriteHeight", "myAppearance", "favoriteAppearance"])
    
    ## 타입이 JSON인 feature 이름 가져오기
    query_row = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = %s AND DATA_TYPE = 'json'"
    cursor.execute(query_row, ("idealType", ))
    json_columns = [column[0] for column in cursor.fetchall()]
    
    cursor.close()
    conn.close()
    return df, list(set(json_columns))

def process_data():
    df, json_columns = fetch_mbti_data()
    df_copy = df.copy()
    # print(user_df.head()); print(others_df.head())
    # print(json_columns)
    
    for feature in json_columns:
        df_copy[feature] = df_copy[feature].apply(lambda x: json.loads(x) if x is not None else {})
    # print(user_df.head()); print(others_df.head())
    
    feature_list = df.columns[(df.columns != "userUID")]
    type_list = [gender_types, mbti_types, height_types, appearance_types]
    for i, feature in enumerate(feature_list):
        if not isinstance(df_copy[feature][0], list):
            df_copy[feature] = df_copy[feature].apply(lambda x: to_one_hot(x, type_list[i // 2]))
        else:
            df_copy[feature] = df_copy[feature].apply(lambda x: list_to_multiply_hot(x, type_list[i // 2]))
    # print(df.head())
    
    return df, df_copy, feature_list
    
def search_users(df_origin, df, feature_list, userUID):        
    if not userUID in df["userUID"].values:
        raise f"이용하실 수 없는 유저입니다. uid: {userUID}"
    
    ## user_df, others_df 분리
    user_df = df[df["userUID"] == userUID]
    others_df = df[df["userUID"] != userUID]
    
    ## FAISS를 위한 벡터리스트로 변환
    user_vector_list = [feature for i, feature in enumerate(feature_list) if i % 2 != 0]
    # print(f"user_vector: {user_vector_list}")
    others_vector_list = [feature for i, feature in enumerate(feature_list) if i % 2 == 0]
    # print(f"other_vector: {others_vector_list}")
    
    # db = [mbti, 남의키, 남이 원하는 키]
    # query = [내가원하는 mbti, 내가 원하는 키, 나의키]
    
    
    ## 벡터 결합
    user_combined_vectors = np.array([np.concatenate([user_df[col].iloc[i] for col in user_vector_list], axis=None) for i in range(len(user_df))], dtype=np.float32)
    others_combined_vectors = np.array([np.concatenate([others_df[col].iloc[i] for col in others_vector_list], axis=None) for i in range(len(others_df))], dtype=np.float32)
    
    ## 벡터 정규화
    faiss.normalize_L2(user_combined_vectors)
    faiss.normalize_L2(others_combined_vectors)

    ## FAISS 인덱스 생성
    index = faiss.IndexFlatL2(user_combined_vectors.shape[1])
    index.add(others_combined_vectors)
    
    ## 유사도 측정 - 최대 50개
    distances, indices = index.search(user_combined_vectors, k=50)
    # similar_users = [others_combined_vectors[i] for i in indices[0]]
    # print("유사한 벡터:", similar_users)
    
    #### 주의!! 회원 수가 적어서 추천해줄 수 있는 인원이 적은 경우 indices 값에 "-1" 들어있을 수 있습니다.
    valid_indices = [i for i in indices[0] if i != -1]
    
    
    ## 순서 재정렬
    # user_height = user_df["myHeight"].iloc[0]
    # valid_indices_sorted = sorted(valid_indices, key=lambda i: others_df["favoriteHeight"].iloc[i] != user_height, reverse=True)
    
    ## 일치하지 않거나 포함되어 있지 않는다면 패널티 부여 ( 패널티 : 추가점수 ) - 유클리드 거리는 짧을수록 유사도 큼
    add_score = 0.1
    gender_mismatch_score = 1.0  # 성별 불일치 시 추가할 점수

    adjusted_scores = [
        (i, (distances[0][idx])
            + (add_score if user_df["myHeight"].iloc[0] != others_df["favoriteHeight"].iloc[i] else 0)
            + (add_score if any(item not in user_df["myAppearance"].tolist() for item in others_df["favoriteAppearance"].tolist()) else 0)
            + (gender_mismatch_score if user_df["myGender"].iloc[0] != others_df["recommendGender"].iloc[i] else 0))  # 더 높은 점수 부여
        for idx, i in enumerate(valid_indices)
    ]
    
    adjusted_scores.sort(key=lambda x: x[1])
    sorted_indices = [x[0] for x in adjusted_scores]
    
    df_origin = df_origin[df_origin['userUID'] != userUID]
    
    ## 최종결과를 JSON 형식으로 반환
    similar_users_data = df_origin.iloc[sorted_indices].to_dict(orient="records")
    
    return similar_users_data[:10] if len(similar_users_data) >= 10 else similar_users_data

    # ## 최종결과 - 인덱스로 userUID 매핑
    # similar_userUIDs = [others_df["userUID"].iloc[i] for i in sorted_indices]
    # # print("유사한 userUIDs:", similar_userUIDs)
    
    # return similar_userUIDs[0:10]

# 임시로 유저UID 다음과 같이 지정
def main(df_origin, df, feature_list, userUID):
    try:
        recommend_result = search_users(df_origin, df, feature_list, userUID)
        # print(f"추천된 사용자들: {recommend_result}")
        return recommend_result
    except Exception as e:
        print(f"오류: {e}")
if __name__ == "__main__":
    main("0026469667")
    # main("김시현") ## 존재하지 않는 userUID 테스트