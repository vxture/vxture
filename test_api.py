import requests
import json

try:
    response = requests.get("http://localhost:8001/health")
    print(f"状态码: {response.status_code}")
    print(f"响应内容: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"请求失败: {e}")
