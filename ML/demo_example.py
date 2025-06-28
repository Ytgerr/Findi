import requests

url = "http://127.0.0.1:8000/semantic-search/"
file_path = "ML/datasets/DSL.pdf"

query = "fight the influence of anomalous measurements"
file_type = "pdf"

with open(file_path, "rb") as f:
    files = {
        "file": ("DSL.pdf", f, "application/pdf")
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
