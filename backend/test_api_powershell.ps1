# PowerShell API Test Script for YÖN Backend
# Make sure the Django server is running: python manage.py runserver

Write-Host "Testing YÖN Backend API with PowerShell..." -ForegroundColor Green
Write-Host "Make sure Django server is running on http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host ""

# 1. Test user registration
Write-Host "1. Testing User Registration..." -ForegroundColor Cyan
$registerBody = @{
    username = "testuser"
    email = "test@test.com"
    password = "test123456"
    password_confirm = "test123456"
    first_name = "Test"
    last_name = "User"
    bolum = "sayisal"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/auth/register/" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody
    
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host $registerResponse.Content
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        Write-Host $reader.ReadToEnd() -ForegroundColor Red
    }
}

Write-Host ""

# 2. Test user login
Write-Host "2. Testing User Login..." -ForegroundColor Cyan
$loginBody = @{
    email = "test@test.com"
    password = "test123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/auth/login/" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "Access Token: $($loginData.access)" -ForegroundColor Yellow
    Write-Host "Refresh Token: $($loginData.refresh)" -ForegroundColor Yellow
    
    $accessToken = $loginData.access
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        Write-Host $reader.ReadToEnd() -ForegroundColor Red
    }
    exit
}

Write-Host ""

# 3. Test exam categories
Write-Host "3. Testing Exam Categories..." -ForegroundColor Cyan
try {
    $categoriesResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/exams/categories/" `
        -Method GET `
        -Headers @{Authorization = "Bearer $accessToken"}
    
    Write-Host "Categories retrieved successfully!" -ForegroundColor Green
    $categories = $categoriesResponse.Content | ConvertFrom-Json
    foreach ($category in $categories.results) {
        Write-Host "- $($category.name): $($category.description)" -ForegroundColor White
    }
} catch {
    Write-Host "Failed to get categories: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Test subjects
Write-Host "4. Testing Subjects..." -ForegroundColor Cyan
try {
    $subjectsResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/exams/subjects/" `
        -Method GET `
        -Headers @{Authorization = "Bearer $accessToken"}
    
    Write-Host "Subjects retrieved successfully!" -ForegroundColor Green
    $subjects = $subjectsResponse.Content | ConvertFrom-Json
    foreach ($subject in $subjects.results) {
        Write-Host "- $($subject.name) ($($subject.category_name))" -ForegroundColor White
    }
} catch {
    Write-Host "Failed to get subjects: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Test topics tree
Write-Host "5. Testing Topics Tree..." -ForegroundColor Cyan
try {
    $topicsResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/exams/topics/tree/" `
        -Method GET `
        -Headers @{Authorization = "Bearer $accessToken"}
    
    Write-Host "Topics tree retrieved successfully!" -ForegroundColor Green
    $topics = $topicsResponse.Content | ConvertFrom-Json
    Write-Host "Found $($topics.Count) main topics" -ForegroundColor White
    foreach ($topic in $topics | Select-Object -First 3) {
        Write-Host "- $($topic.name) (Level: $($topic.level), Children: $($topic.children.Count))" -ForegroundColor White
    }
} catch {
    Write-Host "Failed to get topics: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 6. Test random questions
Write-Host "6. Testing Random Questions..." -ForegroundColor Cyan
try {
    $questionsResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/exams/questions/random/?count=3" `
        -Method GET `
        -Headers @{Authorization = "Bearer $accessToken"}
    
    Write-Host "Random questions retrieved successfully!" -ForegroundColor Green
    $questions = $questionsResponse.Content | ConvertFrom-Json
    Write-Host "Generated $($questions.Count) random questions" -ForegroundColor White
    foreach ($question in $questions) {
        Write-Host "- $($question.text) (Difficulty: $($question.difficulty), Topic: $($question.topic_name))" -ForegroundColor White
    }
} catch {
    Write-Host "Failed to get questions: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "API testing completed!" -ForegroundColor Green 