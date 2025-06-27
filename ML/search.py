import faiss
from nltk.tokenize import sent_tokenize
import nltk

nltk.download("punkt", quiet=True)

def similarity_search(text, query, model):

    sentences = sent_tokenize(text)

    sentences_embeddings = model.encode(sentences, convert_to_numpy=True)
    dimension = sentences_embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(sentences_embeddings)

    query_embedding = model.encode([query], convert_to_numpy=True)

    distances, indices = index.search(query_embedding, k=len(sentences))
    max_distance = 1

    filtered_results = []
    for i, idx in enumerate(indices[0]):
        distance = distances[0][i]
        if distance < max_distance:
            sentence = sentences[idx]
            filtered_results.append((sentence, distance))
            
    return filtered_results





