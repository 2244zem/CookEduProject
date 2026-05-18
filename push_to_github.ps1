# CookEdu GitHub Auto-Pusher Script
# Created by Antigravity AI Assistant

Clear-Host
Write-Output "========================================================="
Write-Output "      COOKEDU GITHUB AUTO-INSTALLER AND DEPLOYMENT PUSHER"
Write-Output "========================================================="
Write-Output ""

$repoUrl = 'https://github.com/2244zem/CookEduProject.git'
$gitPath = 'git'

# 1. Locate or install Git
Write-Output '[*] Checking for Git installation...'
$hasGlobal = $false
if (Get-Command git -ErrorAction SilentlyContinue) {
    $hasGlobal = $true
}

if ($hasGlobal) {
    Write-Output '[OK] Git is already installed globally!'
} else {
    $portableGitPath = 'D:\git-portable\cmd\git.exe'
    $hasPortable = Test-Path $portableGitPath
    if ($hasPortable) {
        Write-Output '[OK] Portable Git found at: D:\git-portable'
        $gitPath = $portableGitPath
    } else {
        Write-Output '[!] Git not found. Downloading lightweight portable Git (MinGit)...'
        $downloadUrl = 'https://github.com/git-for-windows/git/releases/download/v2.45.1.windows.1/MinGit-2.45.1-64-bit.zip'
        $zipPath = "$PSScriptRoot\mingit.zip"
        
        Write-Output '[*] Downloading MinGit (~27MB) from GitHub...'
        curl.exe -L -o $zipPath $downloadUrl
        Write-Output '[OK] Download complete!'
        
        Write-Output '[*] Extracting to D:\git-portable...'
        New-Item -ItemType Directory -Path 'D:\git-portable' -Force | Out-Null
        Expand-Archive -Path $zipPath -DestinationPath 'D:\git-portable' -Force
        Remove-Item -Path $zipPath -Force
        
        $gitPath = $portableGitPath
        Write-Output '[OK] Portable Git installed successfully!'
    }
}

# 2. Check Git Repo Initialization
Write-Output ''
Write-Output '[*] Initializing local Git repository...'
if (-not (Test-Path "$PSScriptRoot\.git")) {
    & $gitPath init
    Write-Output '[OK] Local Git repository initialized!'
} else {
    Write-Output '[OK] Git repository already initialized.'
}

# 3. Configure Remote URL
Write-Output ''
Write-Output '[*] Checking remote repository origin...'
$remotes = & $gitPath remote -v
if ($remotes -match 'origin') {
    & $gitPath remote set-url origin $repoUrl
    Write-Output '[OK] Remote origin updated'
} else {
    & $gitPath remote add origin $repoUrl
    Write-Output '[OK] Remote origin added'
}

# 4. Git config identity check
$gitName = ''
$gitEmail = ''
try {
    $gitName = & $gitPath config user.name
    $gitEmail = & $gitPath config user.email
} catch {}

if (-not $gitName -or -not $gitEmail) {
    Write-Output ''
    Write-Output '[*] Configuring Git user profile for commit...'
    & $gitPath config user.name '2244zem'
    & $gitPath config user.email '2244zem@users.noreply.github.com'
    Write-Output '[OK] Git identity configured (Name: 2244zem)!'
}

# 5. Staging Files
Write-Output ''
Write-Output '[*] Staging all files...'
& $gitPath add .
Write-Output '[OK] Files staged!'

# 6. Commit message
Write-Output ''
Write-Output '---------------------------------------------------------'
Write-Output 'Masukan Pesan Commit Anda (atau tekan ENTER untuk default):'
$commitMsg = Read-Host '>> '
if (-not $commitMsg) {
    $commitMsg = 'feat: unified navigation bar, theme store, transition speed optimization, and fixed click-blocking overlays'
}

Write-Output ''
Write-Output '[*] Committing changes...'
& $gitPath commit -m $commitMsg
Write-Output '[OK] Commit complete!'

# 7. Push to GitHub
Write-Output ''
Write-Output '[*] Preparing to push to GitHub repository...'
Write-Output 'Note: Jika diminta, masukkan email/username GitHub dan Personal Access Token (PAT) atau password Anda.'
Write-Output ''

# Determine branch name (main or master)
$branches = & $gitPath branch
$branchName = 'main'
if ($branches -match 'master') {
    $branchName = 'master'
} else {
    & $gitPath branch -M main
}

Write-Output "Pushing to branch: $branchName..."
& $gitPath push -u origin $branchName

Write-Output ''
Write-Output '========================================================='
Write-Output '               FINISH! PROSES SELESAI                   '
Write-Output '========================================================='
Write-Output ''
Read-Host 'Tekan ENTER untuk menutup...'
