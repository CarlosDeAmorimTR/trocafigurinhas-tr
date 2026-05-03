param(
    [Parameter(Mandatory)]
    [string]$ConnectionString,
    [Parameter(Mandatory)]
    [string]$Sql
)

# Bloqueia qualquer DML/DDL
$blocked = @('INSERT', 'UPDATE', 'DELETE', 'MERGE', 'TRUNCATE', 'DROP', 'CREATE', 'ALTER', 'GRANT', 'REVOKE', 'EXECUTE', 'EXEC', 'CALL')

foreach ($keyword in $blocked) {
    if ($Sql -match "\b$keyword\b") {
        Write-Error "BLOQUEADO: comando '$keyword' nao e permitido. Apenas SELECT e aceito."
        exit 1
    }
}

# Executa apenas se passou na validacao
@"
SET LINESIZE 250
SET PAGESIZE 100
$Sql
EXIT;
"@ | sqlplus -S $ConnectionString
