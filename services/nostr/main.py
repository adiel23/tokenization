from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Nostr Service")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "nostr"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)
