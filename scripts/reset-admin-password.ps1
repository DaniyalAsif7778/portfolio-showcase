param(
  [string]$ProjectRef = "zoqinttgcnecepvzhsvj"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  throw "Node.js and npm are required. Install Node.js, then run this script again."
}

$username = Read-Host "New admin username"
if ([string]::IsNullOrWhiteSpace($username) -or $username -notmatch '^[A-Za-z0-9._@-]{1,100}$') {
  throw "Choose a username using letters, numbers, periods, underscores, @ or hyphens (1 to 100 characters)."
}

$securePassword = Read-Host "New admin password (input is hidden)" -AsSecureString
$secureConfirm = Read-Host "Confirm new admin password" -AsSecureString
$password = [System.Net.NetworkCredential]::new("", $securePassword).Password
$confirmation = [System.Net.NetworkCredential]::new("", $secureConfirm).Password
if ($password.Length -lt 12) { throw "Use a password with at least 12 characters." }
if ($password -ne $confirmation) { throw "Passwords do not match. No changes were made." }

$iterations = 310000
$salt = New-Object byte[] 16
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try {
  $rng.GetBytes($salt)
} finally {
  $rng.Dispose()
}
$derive = [System.Security.Cryptography.Rfc2898DeriveBytes]::new(
  $password,
  $salt,
  $iterations,
  [System.Security.Cryptography.HashAlgorithmName]::SHA256
)
try {
  $hash = $derive.GetBytes(32)
} finally {
  $derive.Dispose()
}
$saltBase64 = [Convert]::ToBase64String($salt)
$hashBase64 = [Convert]::ToBase64String($hash)
$passwordHash = @('pbkdf2_sha256', [string]$iterations, $saltBase64, $hashBase64) -join '$'
$sessionBytes = New-Object byte[] 48
$sessionRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try {
  $sessionRng.GetBytes($sessionBytes)
} finally {
  $sessionRng.Dispose()
}
$sessionSecret = [Convert]::ToBase64String($sessionBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')

# Supabase CLI accepts a .env file. Keep it in the current user's temp folder,
# restrict its ACL, and always remove it after the CLI call.
$tempFile = Join-Path ([System.IO.Path]::GetTempPath()) ("portfolio-admin-" + [guid]::NewGuid().ToString("N") + ".env")
try {
  $lines = @("ADMIN_USERNAME=$username", "ADMIN_PASSWORD_HASH=$passwordHash", "ADMIN_SESSION_SECRET=$sessionSecret")
  [System.IO.File]::WriteAllLines($tempFile, $lines, [System.Text.UTF8Encoding]::new($false))
  $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
  $acl = Get-Acl $tempFile
  $acl.SetAccessRuleProtection($true, $false)
  $rule = [System.Security.AccessControl.FileSystemAccessRule]::new(
    $currentUser,
    [System.Security.AccessControl.FileSystemRights]::FullControl,
    [System.Security.AccessControl.AccessControlType]::Allow
  )
  $acl.SetAccessRule($rule)
  Set-Acl -LiteralPath $tempFile -AclObject $acl

  & npx supabase secrets set --project-ref $ProjectRef --env-file $tempFile
  if ($LASTEXITCODE -ne 0) { throw "Supabase did not accept the credential update. No password was printed." }
  Write-Host "Admin credentials updated and old sessions/rate-limit buckets cleared. Sign in at /admin-panel with the username and password you just entered."
} finally {
  if (Test-Path -LiteralPath $tempFile) { Remove-Item -LiteralPath $tempFile -Force }
  $password = $null
  $confirmation = $null
  $passwordHash = $null
  $saltBase64 = $null
  $hashBase64 = $null
  $sessionSecret = $null
  $securePassword.Dispose()
  $secureConfirm.Dispose()
}
