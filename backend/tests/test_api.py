import requests
import json
import sys
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_health():
    try:
        res = requests.get("http://localhost:8000/")
        return res.status_code == 200
    except:
        return False

def test_analytics_report():
    try:
        # Assumes at least one student exists, or handled by service
        res = requests.post(f"{BASE_URL}/analytics/report", 
                           json={"student_name": "관리자"},
                           timeout=10)
        print(f"Analytics report status: {res.status_code}")
        if res.status_code == 200:
            print(json.dumps(res.json(), indent=2, ensure_ascii=False))
        return res.status_code == 200
    except Exception as e:
        print(f"Analytics report failed: {e}")
        return False

if __name__ == "__main__":
    print("Waiting for server to start...")
    # This script assumes the server is being started in another terminal or background
    # For CI/CD style verification, we might start it here, but for now we just check health
    
    if not test_health():
        print("Server is not running. Please start it with 'python3 -m app.main'")
        # sys.exit(1)
    
    test_analytics_report()
