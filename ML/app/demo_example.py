import requests

url = "http://127.0.0.1:8000/semantic-search/"
file_path = "ML/datasets/video_2025-06-28_19-38-32.mp4"

query = "друга заберут в армию?"
file_type = "mp4"

with open(file_path, "rb") as f:
    files = {
        "file": ("video.mp4", f, "video/mp4")
    }
    data = {
        "query": query,
        "types": file_type
    }

    response = requests.post(url, files=files, data=data)

print("Status code:", response.status_code)

try:
    print("Response:", response.json())
except Exception:
    print("Raw response:", response.text)
