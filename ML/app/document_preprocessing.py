import pandas as pd
import tempfile
import ffmpeg
from nltk.tokenize import sent_tokenize
from io import BytesIO
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer
import re
import os


def preprocessing(File: bytes, file_type: str, model) -> pd.DataFrame:
    match file_type:
        case "mp4":
            data = video_transcribe(File, model)
        case "mp3":
            data = audio_transcribe(File, model)
        case "pdf":
            data = pdf_transcribe(File)

    if "start_time" not in data.columns:
        data["start_time"] = None
    if "end_time" not in data.columns:
        data["end_time"] = None
    return data[["sentences", "start_time", "end_time"]]


def pdf_transcribe(pdf_bytes: bytes) -> pd.DataFrame:
    text_per_page = {}
    pdf_stream = BytesIO(pdf_bytes)

    for pagenum, page in enumerate(extract_pages(pdf_stream)):
        page_content = []
        for element in page:
            if isinstance(element, LTTextContainer):
                line_text = element.get_text()
                page_content.append(line_text)
        text_per_page[pagenum] = ''.join(page_content)

    text = ''.join(text_per_page.values())
    sentences = sent_tokenize(text)
    sentences = [re.sub(r"\n", " ", sent) for sent in sentences]

    return pd.DataFrame({"sentences": sentences})


def audio_transcribe(File: bytes, model) -> pd.DataFrame:
    import os
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp.write(File)
        tmp.flush()
        tmp_path = tmp.name

    try:
        result = model.transcribe(tmp_path)
        segments = result.get("segments", [])
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    data = []
    for seg in segments:
        start_time = seg['start']
        end_time = seg['end']
        text = seg['text'].strip()
        data.append({
            "start_time": start_time,
            "end_time": end_time,
            "sentences": text
        })

    return pd.DataFrame(data)


def video_transcribe(File: bytes, model) -> pd.DataFrame:
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as video_tmp:
        video_tmp.write(File)
        video_tmp.flush()
        video_tmp_path = video_tmp.name

    try:
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as audio_tmp:
            audio_tmp_path = audio_tmp.name

        try:
            out, err = (
                ffmpeg
                .input(video_tmp_path)
                .output(audio_tmp_path, format='mp3', acodec='libmp3lame', ac=1, ar='16000')
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            with open(audio_tmp_path, "rb") as f:
                audio_bytes = f.read()
            return audio_transcribe(audio_bytes, model)
        finally:
            if os.path.exists(audio_tmp_path):
                os.remove(audio_tmp_path)
    finally:
        if os.path.exists(video_tmp_path):
            os.remove(video_tmp_path)
