Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\uvicorn main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host "                  VIGIL AI PROCUREMENT PLATFORM              " -ForegroundColor Cyan -Bold
Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host "Starting Vigil developer servers in secondary processes..."
Write-Host ""
Write-Host "Frontend Dashboard  : http://localhost:3000" -ForegroundColor Green
Write-Host "API Documentation   : http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Relational Database : backend/vigil.db (SQLite)" -ForegroundColor Gray
Write-Host "Vector Store Database: backend/chroma_store/ (ChromaDB)" -ForegroundColor Gray
Write-Host "LLM Integrations    : DeepSeek API (model: deepseek-chat)" -ForegroundColor Magenta
Write-Host ""
Write-Host "Ensure your DEEPSEEK_API_KEY is configured in backend/.env for AI features." -ForegroundColor DarkGray
Write-Host "If the key is missing, Vigil will gracefully fall back to local simulations." -ForegroundColor DarkGray
Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host ""
