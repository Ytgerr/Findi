import faiss


def similarity_search(sentences: list, query: str, model) -> list:

    sentences_embeddings = model.encode(sentences, convert_to_numpy=True)
    dimension = sentences_embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(sentences_embeddings)

    query_embedding = model.encode([query], convert_to_numpy=True)

    distances, indices = index.search(query_embedding, k=3)
    min_distance = 0.4

    filtered_results = []
    for i, idx in enumerate(indices[0]):
        distance = distances[0][i]
        if distance > min_distance:
            sentence = sentences[idx]
            filtered_results.append((sentence, distance))
    filtered_results.sort(key=lambda x: x[1], reverse=True)
    sentences = [item[0] for item in filtered_results]
    return sentences
