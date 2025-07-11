import requests

url = "http://127.0.0.1:8000/semantic-search/"
file_path = "ML/datasets/DSL.pdf"

query = "dimension is asitropic"

with open(file_path, "rb") as f:
    files = {
        "file": ("video.pdf", f, "video/pdf")
    }
    data = {
        "query": query,
    }

    response = requests.post(url, files=files, data=data)

print("Status code:", response.status_code)

try:
    print("Response:", response.json())
except Exception:
    print("Raw response:", response.text)
