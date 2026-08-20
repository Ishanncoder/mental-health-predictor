from database import supabase
import joblib
import pandas as pd
from fastapi import FastAPI

from pydantic import BaseModel , Field
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware
model = joblib.load('Mental_Health_Model.pkl')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_methods = ["*"],
    allow_headers = ["*"],
)

class StudentData(BaseModel):
    
    age                     : int = Field(... , ge = 10 , le = 100)
    gender                  : Literal['Male' , 'Female']
    country                 : str
    academic_level          : Literal['Undergraduate' , 'Graduate' , 'High School']
    most_used_platform      : Literal["Instagram", "TikTok", "Facebook", "LinkedIn", "YouTube", "Twitter", "Snapchat", 
                                      "WhatsApp", "LINE", "VKontakte", "KakaoTalk", "WeChat"]
    purpose_of_use          : Literal['Networking' , 'Education' , 'Entertainment' , 'News']
    avg_daily_usage_hours   : float = Field(... , ge =0 , le = 24)
    daily_unlocks           : int = Field(...,ge=0)
    study_hours             : float = Field(...,ge=0,le=24)
    physical_activity_hours : float = Field(...,ge=0 , le=24)
    sleep_hours_per_night   : float = Field(... , ge=0 , le = 24)
    stress_level            : Literal['Low' , 'Medium' , 'High' , 'Very High']



class PredictionResponse(BaseModel):
    predicted_mental_health_score : float




@app.get('/')
def hello():
    return "Hello"



top_countries = ['Other' , 'India' ,'USA','Canada', 'Australia', 'UK','Germany','Mexico','Turkey','France']            

@app.post('/predict' , response_model = PredictionResponse)
def predict(data : StudentData):
    
    Grouped_Country = data.country if data.country in top_countries else 'Other'
    input_rows = pd.DataFrame([{
        'Age'                    : data.age,
        'Gender'                 : data.gender,
        'Country'                : data.country,
        'Academic_Level'         : data.academic_level,
        'Most_Used_Platform'     : data.most_used_platform,
        'Purpose_Of_Use'         : data.purpose_of_use,
        'Avg_Daily_Usage_Hours'  : data.avg_daily_usage_hours,
        'Daily_Unlocks'          : data.daily_unlocks,
        'Study_Hours'            : data.study_hours,
        'Physical_Activity_Hours': data.physical_activity_hours,
        'Sleep_Hours_Per_Night'  : data.sleep_hours_per_night,
        'Stress_Level'           : data.stress_level,
        'Grouped_Country'        : Grouped_Country
    }])
 
 
    prediction = model.predict(input_rows)[0]   
    
    supabase.table("predictions").insert({
        "age": data.age,
        "gender": data.gender,
        "country": data.country,
        "academic_level": data.academic_level,
        "most_used_platform": data.most_used_platform,
        "purpose_of_use": data.purpose_of_use,
        "avg_daily_usage_hours": data.avg_daily_usage_hours,
        "daily_unlocks": data.daily_unlocks,
        "study_hours": data.study_hours,
        "physical_activity_hours": data.physical_activity_hours,
        "sleep_hours_per_night": data.sleep_hours_per_night,
        "stress_level": data.stress_level,
        "predicted_score": float(prediction)
    }).execute()
    
    return PredictionResponse(predicted_mental_health_score = round(float(prediction),2))
    
