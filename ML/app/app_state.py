from sentence_transformers import SentenceTransformer
import whisper


def init_models(app):
    app.state.embed_model = SentenceTransformer(
        "Snowflake/snowflake-arctic-embed-l-v2.0")
    app.state.audio_model = whisper.load_model("base")
