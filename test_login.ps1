$loginBody = '{"email":"admin@cutm.ac.in","password":"password"}'
$venueBody = '{"name":"Real Admin Test 9093","category":"ACADEMIC","capacity":50,"location":"Test Block","type":"Classroom","equipment":[],"image":"https://example.com/img.jpg"}'

try {
    Write-Host "Logging in as admin@cutm.ac.in on 9093..."
    $response = Invoke-RestMethod -Uri "http://localhost:9093/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $response.token
    Write-Host "Login Success."
}
catch {
    Write-Host "Login Failed: $_"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody"
    }
    exit 1
}

try {
    Write-Host "Attempting Create Venue..."
    $response = Invoke-RestMethod -Uri "http://localhost:9093/api/venues" -Method Post -Body $venueBody -ContentType "application/json" -Headers @{Authorization = ("Bearer " + $token) }
    Write-Host "Create Venue Success!"
    Write-Host $response
}
catch {
    Write-Host "Create Venue Failed: $_"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody"
    }
}
