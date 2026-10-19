param(
    [switch]$FromClipboard,
    [switch]$SelfTest
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Security

if ($SelfTest) {
    $sample = [Text.Encoding]::UTF8.GetBytes('mk-local-self-test-not-a-real-credential')
    $encrypted = [Security.Cryptography.ProtectedData]::Protect($sample, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
    $decrypted = [Security.Cryptography.ProtectedData]::Unprotect($encrypted, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
    if ([Convert]::ToBase64String($sample) -ne [Convert]::ToBase64String($decrypted)) { throw 'DPAPI round trip failed.' }
    [Array]::Clear($sample, 0, $sample.Length)
    [Array]::Clear($decrypted, 0, $decrypted.Length)
    '{"dpapi_round_trip":"passed","network_used":false,"real_key_used":false}'
    exit 0
}

if (-not $env:LOCALAPPDATA) { throw 'Windows LOCALAPPDATA is unavailable.' }
$keyText = $null
$plainBytes = $null
$roundTrip = $null
$clipboardUsed = $false
try {
    if ($FromClipboard) {
        Add-Type -AssemblyName System.Windows.Forms
        $keyText = [Windows.Forms.Clipboard]::GetText().Trim()
        $clipboardUsed = $true
    } else {
        $secretInput = Read-Host 'Paste the Metaso API Key (input is hidden)' -AsSecureString
        $secretPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretInput)
        try { $keyText = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretPtr).Trim() }
        finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPtr); $secretInput.Dispose() }
    }
    if ($keyText -notmatch '^mk-[A-Za-z0-9_-]{10,}$') {
        throw 'No valid Metaso mk- key was supplied. Copy the key from Console > Request management. Nothing was saved.'
    }
    $credentialDir = Join-Path $env:LOCALAPPDATA 'ui-motion-fusion'
    $credentialFile = Join-Path $credentialDir 'metaso-api-key.dpapi'
    $plainBytes = [Text.Encoding]::UTF8.GetBytes($keyText)
    if (Test-Path -LiteralPath $credentialFile) {
        $stored = [Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($credentialFile), $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
        try {
            if ([Convert]::ToBase64String($stored) -ne [Convert]::ToBase64String($plainBytes)) {
                throw 'A different key is already configured. Existing credential was kept; request an explicit replacement.'
            }
        } finally { [Array]::Clear($stored, 0, $stored.Length) }
    } else {
        [IO.Directory]::CreateDirectory($credentialDir) | Out-Null
        $cipherBytes = [Security.Cryptography.ProtectedData]::Protect($plainBytes, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
        $stream = [IO.File]::Open($credentialFile, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
        try { $stream.Write($cipherBytes, 0, $cipherBytes.Length); $stream.Flush() }
        finally { $stream.Dispose() }
    }
    $roundTrip = [Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($credentialFile), $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
    if ([Convert]::ToBase64String($roundTrip) -ne [Convert]::ToBase64String($plainBytes)) { throw 'Local credential verification failed.' }
    if ($clipboardUsed -and [Windows.Forms.Clipboard]::GetText().Trim() -ceq $keyText) {
        [Windows.Forms.Clipboard]::Clear()
    }
    [pscustomobject]@{configured=$true; encrypted=$true; scope='Windows CurrentUser'; network_used=$false} | ConvertTo-Json -Compress
} finally {
    if ($plainBytes) { [Array]::Clear($plainBytes, 0, $plainBytes.Length) }
    if ($roundTrip) { [Array]::Clear($roundTrip, 0, $roundTrip.Length) }
    $keyText = $null
}
