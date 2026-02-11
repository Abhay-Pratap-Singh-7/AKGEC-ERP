
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["https://your-site.netlify.app", "http://localhost:3000"]}})

BASE_URL = "https://erp.akgec.ac.in"

def process_attendance_json(raw_data):
    """
    Parses the raw ERP JSON into a structure that separates 
    Summary stats, Daily day-by-day logs, and Student Profile.
    """
    std_details = raw_data.get('stdSubAtdDetails', {})
    
    # 1. Extract Subject-wise Summary
    summary = std_details.get('subjects', [])
    
    # 2. Extract Overall Stats
    overall = {
        "percentage": std_details.get('overallPercentage'),
        "present": std_details.get('overallPresent'),
        "total": std_details.get('overallLecture')
    }

    # 3. Extract Day-by-Day Logs
    daily_logs = raw_data.get('attendanceData', [])
    
    # 4. Extract Extra Lectures
    extra_lectures = raw_data.get('extraLectures', [])

    # 5. Extract Profile Information
    profile = {}
    student_info_list = std_details.get('studentSubjectAttendance', [])
    if student_info_list:
        student_obj = student_info_list[0]
        profile['firstName'] = student_obj.get('firstName')
        
        # Parse the stringified userDetails
        user_details_str = student_obj.get('userDetails', '{}')
        try:
            u_details = json.loads(user_details_str)
            profile.update({
                "dob": u_details.get('dob'),
                "bloodGroup": u_details.get('bloodGroup'),
                "jeeRank": u_details.get('jeeRank'),
                "tenthPercentage": u_details.get('highSchoolPercentage'),
                "twelfthPercentage": u_details.get('intermediatePercentage'),
                "bankName": u_details.get('bankName'),
                "ifscCode": u_details.get('ifscCode'),
                "fatherName": u_details.get('fatherName'),
                "mobileNo": u_details.get('mobileNo')
            })
        except:
            pass

    return {
        "summary": summary,
        "overall": overall,
        "daily_logs": daily_logs,
        "extra_lectures": extra_lectures,
        "profile": profile
    }

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    login_payload = {"grant_type": "password", "username": username, "password": password}
    headers = {"User-Agent": "Mozilla/5.0"}
    
    response = requests.post(f"{BASE_URL}/Token", data=login_payload, headers=headers)
    
    if response.status_code == 200:
        return jsonify({
            "status": "success",
            "access_token": response.json().get("access_token"),
            "user_id": response.json().get("X-UserId"),
            "context_id": response.json().get("X-ContextId"),
            "x_token": response.json().get("X_Token"),
            "session_id": response.json().get("SessionId")
        }), 200
    return jsonify({"error": "Invalid ERP credentials"}), 401

@app.route('/api/attendance', methods=['POST'])
def get_attendance():
    auth = request.json
    headers = {
        "Authorization": f"Bearer {auth.get('access_token')}",
        "x_token": auth.get('x_token'),
        "x-contextid": str(auth.get('context_id')),
        "x-userid": str(auth.get('user_id')),
        "sessionid": auth.get('session_id'),
        "x-rx": "1",
        "x-wb": "1",
        "x_app_year": "2025",
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
    }
    params = {"isDateWise": "false", "termId": "0", "userId": auth.get('user_id'), "y": "0"}
    response = requests.get(f"{BASE_URL}/api/SubjectAttendance/GetPresentAbsentStudent", headers=headers, params=params)
    
    if response.status_code == 200:
        formatted_data = process_attendance_json(response.json())
        return jsonify(formatted_data), 200
    return jsonify({"error": "Failed to fetch data"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
