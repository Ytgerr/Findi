## Dependancies Installation

### Use uv for installation (can be loaded at [link](https://docs.astral.sh/uv/getting-started/installation/))

At first, sync all dependencies with virtual environment by 
```bash 
$ uv sync 
```

and then run app by
```bash 
$ uv run fastapi dev
``` 

## Docker

To run this backend by docker you should build the image first
```bash 
$ docker build -t findi-backend .
```

And then run container with 
```bash
$ docker run -p 8000:80 findi-backend
```